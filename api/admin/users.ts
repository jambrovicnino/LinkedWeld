import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { getUserFromRequest } from '../_lib/auth';
import { ok, err, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth || auth.role !== 'admin') return err(res, 'Admin access required', 403);
  const db = await getDb();

  if (req.method === 'GET') {
    const users = db.prepare('SELECT id, email, first_name as firstName, last_name as lastName, role, is_active as isActive, subscription_tier as subscriptionTier, created_at as createdAt FROM users ORDER BY created_at DESC').all();
    return ok(res, users);
  }

  if (req.method === 'PUT') {
    const { userId, role, isActive } = req.body;
    if (role) db.prepare('UPDATE users SET role = ?, updated_at = datetime("now") WHERE id = ?').run(role, userId);
    if (isActive !== undefined) db.prepare('UPDATE users SET is_active = ?, updated_at = datetime("now") WHERE id = ?').run(isActive ? 1 : 0, userId);
    return ok(res, { message: 'User updated' });
  }

  return err(res, 'Method not allowed', 405);
}
