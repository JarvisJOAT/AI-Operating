/**
 * Documents Routes
 * Document versioning system
 * @module routes/documents
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/**
 * GET /api/documents/:projectId
 * Get all documents for a project
 */
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from('project_documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch documents' });
  }
});

/**
 * GET /api/documents/detail/:id
 * Get document with all versions
 */
router.get('/detail/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: document, error: docError } = await supabase
      .from('project_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const { data: versions, error: verError } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', id)
      .order('version_number', { ascending: false });

    if (verError) throw verError;

    res.json({
      success: true,
      data: {
        ...document,
        versions: versions || [],
      },
    });
  } catch (error) {
    logger.error('Error fetching document:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch document' });
  }
});

/**
 * POST /api/documents/upload
 * Upload a new document
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { projectId, name, description, uploadedBy } = req.body;

    if (!projectId || !uploadedBy) {
      return res.status(400).json({
        success: false,
        error: 'projectId and uploadedBy are required',
      });
    }

    // Upload file to storage
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `documents/${projectId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('project_documents')
      .insert({
        project_id: projectId,
        name: name || req.file.originalname,
        description,
        file_type: fileExt || 'unknown',
        current_version: 1,
        created_by: uploadedBy,
      })
      .select()
      .single();

    if (docError) throw docError;

    // Create first version
    await supabase.from('document_versions').insert({
      document_id: document.id,
      version_number: 1,
      file_url: urlData.publicUrl,
      file_size: req.file.size,
      changes_summary: 'Initial upload',
      uploaded_by: uploadedBy,
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    logger.error('Error uploading document:', error);
    res.status(500).json({ success: false, error: 'Failed to upload document' });
  }
});

/**
 * POST /api/documents/:id/version
 * Upload a new version of a document
 */
router.post('/:id/version', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { changesSummary, uploadedBy } = req.body;

    if (!uploadedBy) {
      return res.status(400).json({
        success: false,
        error: 'uploadedBy is required',
      });
    }

    // Get current document
    const { data: document, error: docError } = await supabase
      .from('project_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const newVersion = document.current_version + 1;

    // Upload file
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `documents/${document.project_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Create version record
    const { data: version, error: verError } = await supabase
      .from('document_versions')
      .insert({
        document_id: id,
        version_number: newVersion,
        file_url: urlData.publicUrl,
        file_size: req.file.size,
        changes_summary: changesSummary || `Version ${newVersion}`,
        uploaded_by: uploadedBy,
      })
      .select()
      .single();

    if (verError) throw verError;

    // Update document
    await supabase
      .from('project_documents')
      .update({
        current_version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    res.status(201).json({
      success: true,
      data: version,
      message: `Version ${newVersion} uploaded`,
    });
  } catch (error) {
    logger.error('Error uploading version:', error);
    res.status(500).json({ success: false, error: 'Failed to upload version' });
  }
});

/**
 * GET /api/documents/version/:versionId
 * Get a specific version
 */
router.get('/version/:versionId', async (req: Request, res: Response) => {
  try {
    const { versionId } = req.params;

    const { data, error } = await supabase
      .from('document_versions')
      .select('*, project_documents (*)')
      .eq('id', versionId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Version not found' });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching version:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch version' });
  }
});

/**
 * DELETE /api/documents/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete all versions and document
    const { error } = await supabase
      .from('project_documents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Document and all versions deleted' });
  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({ success: false, error: 'Failed to delete document' });
  }
});

export default router;

