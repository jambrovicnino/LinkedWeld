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
  const { id } = req.query;
  const worker = db.prepare('SELECT u.id, u.first_name as firstName, u.last_name as lastName, u.email, wp.* FROM users u LEFT JOIN worker_profiles wp ON u.id = wp.user_id WHERE u.id = ?').get(id);
  if (!worker) return err(res, 'Worker not found', 404);
  return ok(res, worker);
}
