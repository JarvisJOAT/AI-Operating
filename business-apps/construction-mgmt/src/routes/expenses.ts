/**
 * Expenses Routes
 * @module routes/expenses
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/expenses
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { projectId, category, startDate, endDate, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('expenses')
      .select('*, receipts (*)', { count: 'exact' })
      .order('expense_date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (projectId) query = query.eq('project_id', projectId);
    if (category) query = query.eq('category', category);
    if (startDate) query = query.gte('expense_date', startDate);
    if (endDate) query = query.lte('expense_date', endDate);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, pagination: { total: count, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch expenses' });
  }
});

/**
 * GET /api/expenses/summary/:projectId
 * Get expense summary by category
 */
router.get('/summary/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from('expenses')
      .select('category, amount')
      .eq('project_id', projectId);

    if (error) throw error;

    // Group by category
    const summary: Record<string, { total: number; count: number }> = {};
    let grandTotal = 0;

    for (const expense of data || []) {
      if (!summary[expense.category]) {
        summary[expense.category] = { total: 0, count: 0 };
      }
      summary[expense.category].total += expense.amount;
      summary[expense.category].count += 1;
      grandTotal += expense.amount;
    }

    const categories = Object.entries(summary).map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
      percentage: grandTotal > 0 ? Math.round((stats.total / grandTotal) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    res.json({
      success: true,
      data: {
        grandTotal,
        expenseCount: data?.length || 0,
        categories,
      },
    });
  } catch (error) {
    logger.error('Error fetching expense summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch expense summary' });
  }
});

/**
 * POST /api/expenses
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      projectId, receiptId, description, amount, category,
      expenseDate, vendorName, paymentMethod, createdBy
    } = req.body;

    if (!projectId || !description || !amount || !category || !expenseDate || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'projectId, description, amount, category, expenseDate, and createdBy are required',
      });
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        project_id: projectId,
        receipt_id: receiptId,
        description,
        amount,
        category,
        expense_date: expenseDate,
        vendor_name: vendorName,
        payment_method: paymentMethod,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    // Update project spent amount
    await updateProjectSpent(projectId);

    res.status(201).json({ success: true, data });
  } catch (error) {
    logger.error('Error creating expense:', error);
    res.status(500).json({ success: false, error: 'Failed to create expense' });
  }
});

/**
 * PATCH /api/expenses/:id
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.project_id;
    delete updates.created_by;
    delete updates.created_at;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update project spent amount
    if (data) {
      await updateProjectSpent(data.project_id);
    }

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating expense:', error);
    res.status(500).json({ success: false, error: 'Failed to update expense' });
  }
});

/**
 * POST /api/expenses/:id/approve
 */
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const { data, error } = await supabase
      .from('expenses')
      .update({
        is_approved: true,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: 'Expense approved' });
  } catch (error) {
    logger.error('Error approving expense:', error);
    res.status(500).json({ success: false, error: 'Failed to approve expense' });
  }
});

/**
 * DELETE /api/expenses/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get project ID before deleting
    const { data: expense } = await supabase
      .from('expenses')
      .select('project_id')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update project spent amount
    if (expense) {
      await updateProjectSpent(expense.project_id);
    }

    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    logger.error('Error deleting expense:', error);
    res.status(500).json({ success: false, error: 'Failed to delete expense' });
  }
});

/**
 * GET /api/expenses/categories
 * Get available expense categories
 */
router.get('/categories/list', (req: Request, res: Response) => {
  const categories = [
    'Materials',
    'Labor',
    'Equipment',
    'Tools',
    'Permits',
    'Insurance',
    'Transportation',
    'Utilities',
    'Subcontractor',
    'Miscellaneous',
  ];

  res.json({ success: true, data: categories });
});

/**
 * Helper: Update project spent amount
 */
async function updateProjectSpent(projectId: string) {
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('project_id', projectId);

  const totalSpent = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  await supabase
    .from('construction_projects')
    .update({ spent: totalSpent, updated_at: new Date().toISOString() })
    .eq('id', projectId);
}

export default router;

