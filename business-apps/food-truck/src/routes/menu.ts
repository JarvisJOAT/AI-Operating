/**
 * Menu Routes
 * 
 * API endpoints for menu management.
 * 
 * @module routes/menu
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/menu/categories
 * Get all menu categories
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const { organizationId, activeOnly = 'true' } = req.query;

    let query = supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (activeOnly === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/menu/items
 * Get all menu items with optional filtering
 */
router.get('/items', async (req: Request, res: Response) => {
  try {
    const { organizationId, categoryId, availableOnly = 'true' } = req.query;

    let query = supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories (id, name)
      `)
      .order('display_order', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (availableOnly === 'true') {
      query = query.eq('is_available', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching menu items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch menu items' });
  }
});

/**
 * GET /api/menu/items/:id
 * Get a specific menu item
 */
router.get('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('menu_items')
      .select(`*, menu_categories (id, name)`)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch menu item' });
  }
});

/**
 * POST /api/menu/categories
 * Create a new category
 */
router.post('/categories', async (req: Request, res: Response) => {
  try {
    const { organizationId, name, description, imageUrl, displayOrder } = req.body;

    if (!organizationId || !name) {
      return res.status(400).json({
        success: false,
        error: 'organizationId and name are required',
      });
    }

    const { data, error } = await supabase
      .from('menu_categories')
      .insert({
        organization_id: organizationId,
        name,
        description,
        image_url: imageUrl,
        display_order: displayOrder || 0,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({ success: false, error: 'Failed to create category' });
  }
});

/**
 * POST /api/menu/items
 * Create a new menu item
 */
router.post('/items', async (req: Request, res: Response) => {
  try {
    const {
      organizationId,
      categoryId,
      name,
      description,
      price,
      imageUrl,
      preparationTime,
      calories,
      allergens,
      modifiers,
      displayOrder,
    } = req.body;

    if (!organizationId || !categoryId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'organizationId, categoryId, name, and price are required',
      });
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        organization_id: organizationId,
        category_id: categoryId,
        name,
        description,
        price,
        image_url: imageUrl,
        preparation_time: preparationTime || 10,
        calories,
        allergens: allergens || [],
        modifiers: modifiers || {},
        display_order: displayOrder || 0,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    logger.error('Error creating menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to create menu item' });
  }
});

/**
 * PATCH /api/menu/items/:id
 * Update a menu item
 */
router.patch('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.organization_id;
    delete updates.created_at;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to update menu item' });
  }
});

/**
 * PATCH /api/menu/items/:id/availability
 * Toggle item availability
 */
router.patch('/items/:id/availability', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const { data, error } = await supabase
      .from('menu_items')
      .update({
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating availability:', error);
    res.status(500).json({ success: false, error: 'Failed to update availability' });
  }
});

/**
 * DELETE /api/menu/items/:id
 * Delete a menu item
 */
router.delete('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    logger.error('Error deleting menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete menu item' });
  }
});

/**
 * GET /api/menu/full
 * Get full menu with categories and items
 */
router.get('/full', async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.query;

    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (catError) throw catError;

    const { data: items, error: itemError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('display_order', { ascending: true });

    if (itemError) throw itemError;

    // Group items by category
    const menu = (categories || []).map(category => ({
      ...category,
      items: (items || []).filter(item => item.category_id === category.id),
    }));

    res.json({ success: true, data: menu });
  } catch (error) {
    logger.error('Error fetching full menu:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch menu' });
  }
});

export default router;

