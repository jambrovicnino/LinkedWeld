import { Router, Response } from 'express';
import { getDb } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
const router = Router();
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const expenses = getDb().prepare('SELECT e.*, ec.name as categoryName FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id WHERE e.user_id = ? ORDER BY e.created_at DESC').all(req.userId);
  res.json({ success: true, data: expenses });
});
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { projectId, categoryId, amount, currency, description, expenseDate, notes } = req.body;
  const result = getDb().prepare('INSERT INTO expenses (user_id, project_id, category_id, amount, currency, description, expense_date, notes) VALUES (?,?,?,?,?,?,?,?)').run(req.userId, projectId, categoryId, amount, currency || 'EUR', description, expenseDate, notes);
  res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});
router.get('/categories', (_req: any, res: Response) => {
  res.json({ success: true, data: getDb().prepare('SELECT * FROM expense_categories').all() });
});
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const expense = getDb().prepare('SELECT e.*, ec.name as categoryName FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id WHERE e.id = ?').get(req.params.id);
  res.json({ success: true, data: expense });
});
router.put('/:id/approve', authenticate, (req: AuthRequest, res: Response) => {
  getDb().prepare('UPDATE expenses SET status = ?, approved_by = ?, updated_at = datetime("now") WHERE id = ?').run(req.body.status, req.userId, req.params.id);
  res.json({ success: true });
});
export default router;
