import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { getUserFromRequest } from '../_lib/auth';
import { ok, err, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();
  const { id } = req.query;

  if (req.method === 'GET') {
    const expense = db.prepare('SELECT e.*, ec.name as categoryName FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id WHERE e.id = ?').get(id);
    return ok(res, expense);
  }

  if (req.method === 'PUT') {
    db.prepare('UPDATE expenses SET status = ?, approved_by = ?, approved_at = datetime("now"), updated_at = datetime("now") WHERE id = ?').run(req.body.status, auth.userId, id);
    return ok(res, { message: 'Expense updated' });
  }

  return err(res, 'Method not allowed', 405);
}
