import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { getUserFromRequest } from '../_lib/auth';
import { ok, err, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth || auth.role !== 'admin') return err(res, 'Admin access required', 403);
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const db = await getDb();
  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any)?.c || 0;
  const activeProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status != 'cancelled'").get() as any)?.c || 0;
  const companies = (db.prepare("SELECT COUNT(DISTINCT company_name) as c FROM users WHERE company_name IS NOT NULL").get() as any)?.c || 0;

  return ok(res, { totalUsers, activeProjects, companies });
}
