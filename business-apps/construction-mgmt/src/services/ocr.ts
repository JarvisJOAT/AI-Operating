/**
 * OCR Service
 * Uses Google Cloud Vision API for receipt processing
 * @module services/ocr
 */

import vision from '@google-cloud/vision';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

// Initialize Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

/**
 * OCR Result structure
 */
interface OCRResult {
  fullText: string;
  vendorName: string | null;
  amount: number | null;
  taxAmount: number | null;
  date: string | null;
  items: Array<{
    description: string;
    amount: number;
  }>;
  confidence: number;
}

/**
 * Process a receipt image or PDF with OCR
 * 
 * @param receiptId - Receipt database ID
 * @param fileBuffer - File buffer
 * @param fileType - 'image' or 'pdf'
 */
export async function processReceiptOCR(
  receiptId: string,
  fileBuffer: Buffer,
  fileType: 'image' | 'pdf'
): Promise<void> {
  logger.info(`Processing OCR for receipt: ${receiptId}`);

  try {
    // Update status to processing
    await supabase
      .from('receipts')
      .update({ ocr_status: 'processing' })
      .eq('id', receiptId);

    let ocrResult: OCRResult;

    if (fileType === 'pdf') {
      ocrResult = await processPDFWithVision(fileBuffer);
    } else {
      ocrResult = await processImageWithVision(fileBuffer);
    }

    // Update receipt with OCR results
    await supabase
      .from('receipts')
      .update({
        ocr_status: 'completed',
        ocr_result: ocrResult,
        vendor_name: ocrResult.vendorName,
        amount: ocrResult.amount,
        tax_amount: ocrResult.taxAmount,
        receipt_date: ocrResult.date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', receiptId);

    logger.info(`OCR completed for receipt: ${receiptId}`);
  } catch (error) {
    logger.error(`OCR failed for receipt ${receiptId}:`, error);

    await supabase
      .from('receipts')
      .update({
        ocr_status: 'failed',
        ocr_result: { error: error instanceof Error ? error.message : 'Unknown error' },
        updated_at: new Date().toISOString(),
      })
      .eq('id', receiptId);
  }
}

/**
 * Process image with Google Cloud Vision
 */
async function processImageWithVision(imageBuffer: Buffer): Promise<OCRResult> {
  const [result] = await client.textDetection({
    image: { content: imageBuffer.toString('base64') },
  });

  const fullText = result.fullTextAnnotation?.text || '';
  
  return parseReceiptText(fullText);
}

/**
 * Process PDF with Google Cloud Vision
 */
async function processPDFWithVision(pdfBuffer: Buffer): Promise<OCRResult> {
  // For PDFs, we use document text detection
  const [result] = await client.documentTextDetection({
    image: { content: pdfBuffer.toString('base64') },
  });

  const fullText = result.fullTextAnnotation?.text || '';
  
  return parseReceiptText(fullText);
}

/**
 * Parse OCR text to extract receipt data
 */
function parseReceiptText(text: string): OCRResult {
  const result: OCRResult = {
    fullText: text,
    vendorName: null,
    amount: null,
    taxAmount: null,
    date: null,
    items: [],
    confidence: 0.8,
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return result;
  }

  // Vendor name: Usually the first line
  result.vendorName = lines[0];

  // Date patterns
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\d{4}-\d{2}-\d{2})/,
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})/i,
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        result.date = normalizeDate(match[1]);
        break;
      }
    }
    if (result.date) break;
  }

  // Amount patterns (looking for TOTAL, AMOUNT DUE, etc.)
  const totalPatterns = [
    /(?:TOTAL|AMOUNT DUE|GRAND TOTAL|BALANCE DUE)[:\s]*\$?([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.\d{2})\s*$/,
  ];

  for (const line of lines.reverse()) { // Check from bottom up
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        result.amount = parseFloat(match[1].replace(',', ''));
        break;
      }
    }
    if (result.amount) break;
  }

  // Tax patterns
  const taxPatterns = [
    /(?:TAX|SALES TAX|HST|GST|VAT)[:\s]*\$?([\d,]+\.?\d*)/i,
  ];

  for (const line of lines) {
    for (const pattern of taxPatterns) {
      const match = line.match(pattern);
      if (match) {
        result.taxAmount = parseFloat(match[1].replace(',', ''));
        break;
      }
    }
    if (result.taxAmount) break;
  }

  // Parse line items (simple pattern: text followed by price)
  const itemPattern = /^(.+?)\s+\$?([\d,]+\.\d{2})$/;
  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match && !line.match(/TOTAL|TAX|SUBTOTAL/i)) {
      result.items.push({
        description: match[1].trim(),
        amount: parseFloat(match[2].replace(',', '')),
      });
    }
  }

  return result;
}

/**
 * Normalize date to ISO format
 */
function normalizeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Ignore parsing errors
  }
  
  return dateStr;
}

export default {
  processReceiptOCR,
};

