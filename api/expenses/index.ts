import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';
import { ok, err, handleCors } from '../_lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();

  if (req.method === 'GET') {
    const expenses = db.prepare('SELECT e.*, ec.name as categoryName FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id WHERE e.user_id = ? ORDER BY e.created_at DESC').all(auth.userId);
    return ok(res, expenses);
  }

  if (req.method === 'POST') {
    const { projectId, categoryId, amount, currency, description, expenseDate, notes } = req.body;
    const result = db.prepare('INSERT INTO expenses (user_id, project_id, category_id, amount, currency, description, expense_date, notes) VALUES (?,?,?,?,?,?,?,?)').run(auth.userId, projectId, categoryId, amount, currency || 'EUR', description, expenseDate, notes);
    return ok(res, { id: result.lastInsertRowid }, 201);
  }

  return err(res, 'Method not allowed', 405);
}
