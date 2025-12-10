# Construction Management OCR Guide

Complete guide for the OCR receipt processing and data extraction system.

## Overview

The OCR system enables:
- **Receipt scanning** - Extract text from photos and scans
- **Structured data extraction** - Parse vendor, amounts, dates
- **Expense auto-creation** - Automatically create expense records
- **Manual correction** - Interface for fixing OCR errors
- **Document versioning** - Track changes to extracted data

## How It Works

### OCR Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      OCR Processing Pipeline                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │  Upload  │───▶│  Pre-process │───▶│  OCR Engine  │           │
│  │  Image   │    │  (enhance)   │    │  (Vision)    │           │
│  └──────────┘    └──────────────┘    └──────┬───────┘           │
│                                             │                    │
│                                             ▼                    │
│                                    ┌────────────────┐            │
│                                    │  Raw Text      │            │
│                                    │  Extraction    │            │
│                                    └───────┬────────┘            │
│                                            │                     │
│                    ┌───────────────────────┼───────────────────┐ │
│                    │                       │                   │ │
│                    ▼                       ▼                   ▼ │
│           ┌───────────────┐     ┌──────────────┐    ┌──────────┐│
│           │ Entity        │     │ Table/Line   │    │ AI-based ││
│           │ Recognition   │     │ Detection    │    │ Analysis ││
│           └───────┬───────┘     └──────┬───────┘    └────┬─────┘│
│                   │                    │                 │      │
│                   └────────────────────┼─────────────────┘      │
│                                        │                        │
│                                        ▼                        │
│                              ┌──────────────────┐               │
│                              │ Structured Data  │               │
│                              │  • Vendor        │               │
│                              │  • Date          │               │
│                              │  • Items         │               │
│                              │  • Total         │               │
│                              │  • Tax           │               │
│                              └────────┬─────────┘               │
│                                       │                         │
│                                       ▼                         │
│                              ┌──────────────────┐               │
│                              │ Manual Review    │               │
│                              │ (if confidence   │               │
│                              │  < threshold)    │               │
│                              └────────┬─────────┘               │
│                                       │                         │
│                                       ▼                         │
│                              ┌──────────────────┐               │
│                              │ Create Expense   │               │
│                              └──────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Supported Formats

### Image Formats

| Format | Support | Notes |
|--------|---------|-------|
| JPEG | ✅ Full | Recommended for photos |
| PNG | ✅ Full | Best for scans |
| TIFF | ✅ Full | High quality scans |
| WebP | ✅ Full | Compressed images |
| HEIC | ⚠️ Partial | Convert recommended |
| BMP | ✅ Full | Windows scans |

### Document Formats

| Format | Support | Notes |
|--------|---------|-------|
| PDF | ✅ Full | Multi-page supported |
| PDF (scanned) | ✅ Full | Requires OCR |
| PDF (text) | ✅ Full | Direct extraction |

### Optimal Image Quality

- **Resolution**: 300 DPI minimum
- **Size**: 2MB - 10MB optimal
- **Orientation**: Any (auto-rotates)
- **Lighting**: Even, minimal shadows
- **Focus**: Clear, no blur

## Configuration

### OCR Service Settings

```typescript
// src/config/ocr.ts

export const ocrConfig = {
  // Primary service
  service: process.env.OCR_SERVICE || 'google', // 'google' | 'aws'
  
  // Processing options
  processing: {
    autoEnhance: true,
    autoRotate: true,
    removeNoise: true,
    deskew: true,
  },
  
  // Confidence thresholds
  confidence: {
    minimumAcceptable: 0.7, // Below this requires review
    autoApprove: 0.95, // Above this auto-creates expense
  },
  
  // Extraction settings
  extraction: {
    useAI: true, // Use GPT for intelligent parsing
    detectTables: true,
    extractLineItems: true,
  },
  
  // File limits
  limits: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxPagesPerPdf: 20,
    supportedFormats: ['jpeg', 'jpg', 'png', 'pdf', 'tiff', 'webp'],
  },
};
```

## API Usage

### Upload and Process Receipt

```typescript
// POST /api/receipts/upload
const response = await fetch('/api/receipts/upload', {
  method: 'POST',
  body: formData, // FormData with 'file' and 'projectId'
});

const result = await response.json();
/*
{
  "receiptId": "uuid",
  "status": "processing",
  "message": "Receipt uploaded and processing started"
}
*/
```

### Get Processing Status

```typescript
// GET /api/receipts/:id/status
const status = await fetch(`/api/receipts/${receiptId}/status`);
/*
{
  "status": "completed",
  "confidence": 0.92,
  "extractedData": {
    "vendor": "Home Depot",
    "date": "2024-01-15",
    "total": 156.78,
    "tax": 12.95,
    "items": [...]
  },
  "requiresReview": false
}
*/
```

### Get Extracted Data

```typescript
// GET /api/receipts/:id
const receipt = await fetch(`/api/receipts/${receiptId}`);
/*
{
  "id": "uuid",
  "projectId": "uuid",
  "originalFile": "https://...",
  "extractedData": {
    "vendor": {
      "value": "Home Depot",
      "confidence": 0.98
    },
    "date": {
      "value": "2024-01-15",
      "confidence": 0.95
    },
    "items": [
      {
        "description": "2x4 Lumber 8ft",
        "quantity": 20,
        "unitPrice": 4.99,
        "total": 99.80,
        "confidence": 0.89
      }
    ],
    "subtotal": {
      "value": 143.83,
      "confidence": 0.92
    },
    "tax": {
      "value": 12.95,
      "confidence": 0.97
    },
    "total": {
      "value": 156.78,
      "confidence": 0.99
    }
  },
  "status": "reviewed",
  "createdExpenseId": "expense-uuid"
}
*/
```

### Update Extracted Data

```typescript
// PUT /api/receipts/:id
await fetch(`/api/receipts/${receiptId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    vendor: 'Home Depot',
    date: '2024-01-15',
    total: 156.78,
    category: 'Materials',
  }),
});
```

## Data Extraction

### Vendor Detection

```typescript
const extractVendor = (text: string): { vendor: string; confidence: number } => {
  // Known vendor patterns
  const vendors = {
    'home depot': /home\s*depot/i,
    'lowes': /lowe'?s/i,
    'menards': /menards/i,
    'ace hardware': /ace\s*hardware/i,
    'sherwin-williams': /sherwin[\s-]*williams/i,
  };
  
  for (const [name, pattern] of Object.entries(vendors)) {
    if (pattern.test(text)) {
      return { vendor: name, confidence: 0.95 };
    }
  }
  
  // Extract from header (usually first few lines)
  const lines = text.split('\n').slice(0, 5);
  const vendorLine = lines.find(line => 
    line.length > 3 && 
    line.length < 50 && 
    !/^\d/.test(line) // Doesn't start with number
  );
  
  return { 
    vendor: vendorLine?.trim() || 'Unknown', 
    confidence: vendorLine ? 0.7 : 0.3 
  };
};
```

### Date Extraction

```typescript
const extractDate = (text: string): { date: string; confidence: number } => {
  // Common date formats
  const datePatterns = [
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, format: 'MM/DD/YYYY' },
    { regex: /(\d{1,2})-(\d{1,2})-(\d{4})/, format: 'MM-DD-YYYY' },
    { regex: /(\d{4})-(\d{1,2})-(\d{1,2})/, format: 'YYYY-MM-DD' },
    { regex: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{1,2}),?\s*(\d{4})/i, format: 'Mon DD, YYYY' },
  ];
  
  for (const { regex, format } of datePatterns) {
    const match = text.match(regex);
    if (match) {
      const parsedDate = parseDate(match[0], format);
      if (isValidDate(parsedDate)) {
        return { date: parsedDate, confidence: 0.9 };
      }
    }
  }
  
  return { date: new Date().toISOString().split('T')[0], confidence: 0.3 };
};
```

### Total Amount Extraction

```typescript
const extractTotal = (text: string): { total: number; confidence: number } => {
  // Look for total keywords
  const totalPatterns = [
    /total:?\s*\$?([\d,]+\.?\d*)/i,
    /amount\s*due:?\s*\$?([\d,]+\.?\d*)/i,
    /grand\s*total:?\s*\$?([\d,]+\.?\d*)/i,
    /balance:?\s*\$?([\d,]+\.?\d*)/i,
  ];
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', ''));
      if (!isNaN(amount)) {
        return { total: amount, confidence: 0.95 };
      }
    }
  }
  
  // Find largest dollar amount (likely the total)
  const amounts = [...text.matchAll(/\$?([\d,]+\.\d{2})/g)]
    .map(m => parseFloat(m[1].replace(',', '')))
    .filter(n => !isNaN(n))
    .sort((a, b) => b - a);
  
  if (amounts.length > 0) {
    return { total: amounts[0], confidence: 0.7 };
  }
  
  return { total: 0, confidence: 0 };
};
```

### Line Item Extraction

```typescript
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  confidence: number;
}

const extractLineItems = (text: string): LineItem[] => {
  const items: LineItem[] = [];
  const lines = text.split('\n');
  
  // Pattern for line items: Description ... Qty ... Price ... Total
  const lineItemPattern = /^(.+?)\s+(\d+)\s+\$?([\d.]+)\s+\$?([\d.]+)$/;
  
  for (const line of lines) {
    const match = line.match(lineItemPattern);
    if (match) {
      items.push({
        description: match[1].trim(),
        quantity: parseInt(match[2]),
        unitPrice: parseFloat(match[3]),
        total: parseFloat(match[4]),
        confidence: 0.85,
      });
    }
  }
  
  return items;
};
```

## AI-Enhanced Extraction

### Using GPT-4o for Intelligent Parsing

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const intelligentExtraction = async (rawText: string): Promise<ExtractedData> => {
  const prompt = `Extract structured data from this receipt. Return JSON with:
- vendor (store name)
- date (YYYY-MM-DD format)
- items (array of {description, quantity, unitPrice, total})
- subtotal
- tax
- total
- paymentMethod (if visible)
- category (one of: Materials, Tools, Equipment, Labor, Services, Other)

If any field is unclear, set confidence to a value between 0-1.

Receipt text:
${rawText}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};
```

## Manual Correction Interface

### Review Queue

```typescript
// Get receipts needing review
const getReviewQueue = async (projectId: string): Promise<Receipt[]> => {
  const { data } = await supabase
    .from('receipts')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'needs_review')
    .order('created_at', { ascending: false });
  
  return data || [];
};
```

### Correction UI Component

```typescript
const ReceiptReview: React.FC<{ receipt: Receipt }> = ({ receipt }) => {
  const [data, setData] = useState(receipt.extractedData);
  
  const handleSave = async () => {
    await updateReceipt(receipt.id, data);
    await createExpense(receipt.projectId, data);
  };
  
  return (
    <div className="receipt-review">
      <div className="image-preview">
        <img src={receipt.originalFile} alt="Receipt" />
      </div>
      
      <form className="correction-form">
        <Field label="Vendor">
          <input
            value={data.vendor}
            onChange={(e) => setData({...data, vendor: e.target.value})}
            className={data.vendorConfidence < 0.8 ? 'low-confidence' : ''}
          />
          <ConfidenceBadge value={data.vendorConfidence} />
        </Field>
        
        <Field label="Date">
          <input
            type="date"
            value={data.date}
            onChange={(e) => setData({...data, date: e.target.value})}
          />
        </Field>
        
        <Field label="Total">
          <input
            type="number"
            step="0.01"
            value={data.total}
            onChange={(e) => setData({...data, total: parseFloat(e.target.value)})}
          />
        </Field>
        
        <Field label="Category">
          <select
            value={data.category}
            onChange={(e) => setData({...data, category: e.target.value})}
          >
            <option value="Materials">Materials</option>
            <option value="Tools">Tools</option>
            <option value="Equipment">Equipment</option>
            <option value="Labor">Labor</option>
            <option value="Services">Services</option>
            <option value="Other">Other</option>
          </select>
        </Field>
        
        <button onClick={handleSave}>Approve & Create Expense</button>
      </form>
    </div>
  );
};
```

## Image Pre-processing

### Enhancement Functions

```typescript
import sharp from 'sharp';

const preprocessImage = async (buffer: Buffer): Promise<Buffer> => {
  return sharp(buffer)
    // Convert to grayscale
    .grayscale()
    // Increase contrast
    .normalize()
    // Sharpen
    .sharpen()
    // Ensure consistent format
    .png()
    .toBuffer();
};

const deskewImage = async (buffer: Buffer): Promise<Buffer> => {
  // Detect and correct skew angle
  // Implementation depends on image processing library
  return buffer;
};
```

## Error Handling

### Common OCR Errors

```typescript
const handleOcrError = (error: any, receiptId: string) => {
  if (error.code === 'IMAGE_TOO_SMALL') {
    return { 
      status: 'error', 
      message: 'Image resolution too low. Please upload a higher quality image.' 
    };
  }
  
  if (error.code === 'UNSUPPORTED_FORMAT') {
    return { 
      status: 'error', 
      message: 'Unsupported file format. Please upload JPEG, PNG, or PDF.' 
    };
  }
  
  if (error.code === 'QUOTA_EXCEEDED') {
    // Queue for later processing
    await queueForRetry(receiptId);
    return { 
      status: 'queued', 
      message: 'High demand. Receipt queued for processing.' 
    };
  }
  
  return { 
    status: 'error', 
    message: 'Failed to process receipt. Please try again or enter manually.' 
  };
};
```

## Best Practices

### For Better OCR Results

1. **Take Clear Photos**
   - Flat surface, no wrinkles
   - Even lighting, no shadows
   - Full receipt in frame
   - Avoid glare on thermal paper

2. **Scan When Possible**
   - Use 300 DPI or higher
   - Color or grayscale (not B&W)
   - Save as PDF or PNG

3. **Keep Receipts**
   - Thermal receipts fade quickly
   - Photograph immediately
   - Store originals in cool, dry place

### For Developers

```typescript
// Always validate extracted data
const validateExtractedData = (data: ExtractedData): ValidationResult => {
  const errors: string[] = [];
  
  // Total should be positive
  if (data.total <= 0) {
    errors.push('Total must be greater than 0');
  }
  
  // Date should not be in future
  if (new Date(data.date) > new Date()) {
    errors.push('Date cannot be in the future');
  }
  
  // Sum of items should approximately equal total
  const itemsTotal = data.items.reduce((sum, item) => sum + item.total, 0);
  if (Math.abs(itemsTotal - data.total) > data.total * 0.1) {
    errors.push('Line items total does not match receipt total');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

---

## Related Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [User Manual](./USER_MANUAL.md)

