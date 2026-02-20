import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';
import { ok, err, handleCors } from '../_lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const db = await getDb();
  const totalProjects = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as any)?.c || 0;
  const activeProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'in_progress'").get() as any)?.c || 0;
  const totalWorkers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'welder'").get() as any)?.c || 0;
  const totalExpenses = (db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses').get() as any)?.total || 0;
  const pendingExpenses = (db.prepare("SELECT COUNT(*) as c FROM expenses WHERE status = 'pending'").get() as any)?.c || 0;
  const totalRevenue = (db.prepare('SELECT COALESCE(SUM(budget), 0) as total FROM projects').get() as any)?.total || 0;

  return ok(res, { totalProjects, activeProjects, totalWorkers, totalExpenses, pendingExpenses, totalRevenue });
}
