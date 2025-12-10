/**
 * Receipts Routes
 * OCR processing for receipts
 * @module routes/receipts
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { processReceiptOCR } from '../services/ocr';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'));
    }
  },
});

/**
 * GET /api/receipts
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { projectId, ocrStatus, category, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('receipts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (projectId) query = query.eq('project_id', projectId);
    if (ocrStatus) query = query.eq('ocr_status', ocrStatus);
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, pagination: { total: count, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    logger.error('Error fetching receipts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch receipts' });
  }
});

/**
 * GET /api/receipts/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        expenses (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Receipt not found' });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching receipt:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch receipt' });
  }
});

/**
 * POST /api/receipts/upload
 * Upload a receipt and process OCR
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { projectId, uploadedBy, category, notes } = req.body;

    if (!projectId || !uploadedBy) {
      return res.status(400).json({
        success: false,
        error: 'projectId and uploadedBy are required',
      });
    }

    // Upload file to Supabase Storage
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `receipts/${projectId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Create receipt record
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

    const { data: receipt, error: insertError } = await supabase
      .from('receipts')
      .insert({
        project_id: projectId,
        file_url: fileUrl,
        file_type: fileType,
        original_filename: req.file.originalname,
        ocr_status: 'pending',
        category,
        notes,
        uploaded_by: uploadedBy,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Process OCR in background
    processReceiptOCR(receipt.id, req.file.buffer, fileType).catch(err => {
      logger.error('OCR processing failed:', err);
    });

    res.status(201).json({
      success: true,
      data: receipt,
      message: 'Receipt uploaded. OCR processing started.',
    });
  } catch (error) {
    logger.error('Error uploading receipt:', error);
    res.status(500).json({ success: false, error: 'Failed to upload receipt' });
  }
});

/**
 * PATCH /api/receipts/:id
 * Update receipt (manual correction of OCR data)
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vendorName, amount, taxAmount, receiptDate, category, notes } = req.body;

    const { data, error } = await supabase
      .from('receipts')
      .update({
        vendor_name: vendorName,
        amount,
        tax_amount: taxAmount,
        receipt_date: receiptDate,
        category,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating receipt:', error);
    res.status(500).json({ success: false, error: 'Failed to update receipt' });
  }
});

/**
 * POST /api/receipts/:id/reprocess
 * Reprocess OCR for a receipt
 */
router.post('/:id/reprocess', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get receipt
    const { data: receipt, error: fetchError } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !receipt) {
      return res.status(404).json({ success: false, error: 'Receipt not found' });
    }

    // Update status to pending
    await supabase
      .from('receipts')
      .update({ ocr_status: 'pending' })
      .eq('id', id);

    // Download file and reprocess
    const response = await fetch(receipt.file_url);
    const buffer = Buffer.from(await response.arrayBuffer());

    processReceiptOCR(id, buffer, receipt.file_type).catch(err => {
      logger.error('OCR reprocessing failed:', err);
    });

    res.json({ success: true, message: 'OCR reprocessing started' });
  } catch (error) {
    logger.error('Error reprocessing receipt:', error);
    res.status(500).json({ success: false, error: 'Failed to reprocess receipt' });
  }
});

/**
 * DELETE /api/receipts/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get receipt to delete file from storage
    const { data: receipt } = await supabase
      .from('receipts')
      .select('file_url')
      .eq('id', id)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete from storage (optional, may fail if URL format changed)
    if (receipt?.file_url) {
      const pathMatch = receipt.file_url.match(/receipts\/[^?]+/);
      if (pathMatch) {
        await supabase.storage.from('documents').remove([pathMatch[0]]);
      }
    }

    res.json({ success: true, message: 'Receipt deleted' });
  } catch (error) {
    logger.error('Error deleting receipt:', error);
    res.status(500).json({ success: false, error: 'Failed to delete receipt' });
  }
});

/**
 * POST /api/receipts/:id/create-expense
 * Create an expense from a receipt
 */
router.post('/:id/create-expense', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { createdBy } = req.body;

    // Get receipt
    const { data: receipt, error: fetchError } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !receipt) {
      return res.status(404).json({ success: false, error: 'Receipt not found' });
    }

    if (!receipt.amount) {
      return res.status(400).json({
        success: false,
        error: 'Receipt amount is required. Please update the receipt first.',
      });
    }

    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        project_id: receipt.project_id,
        receipt_id: id,
        description: `Receipt from ${receipt.vendor_name || 'Unknown Vendor'}`,
        amount: receipt.amount,
        category: receipt.category || 'Materials',
        expense_date: receipt.receipt_date || new Date().toISOString().split('T')[0],
        vendor_name: receipt.vendor_name,
        created_by: createdBy,
      })
      .select()
      .single();

    if (expenseError) throw expenseError;

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    logger.error('Error creating expense from receipt:', error);
    res.status(500).json({ success: false, error: 'Failed to create expense' });
  }
});

export default router;

