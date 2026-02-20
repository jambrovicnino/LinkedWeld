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
    const user = db.prepare('SELECT id, email, first_name as firstName, last_name as lastName, role, phone, avatar_url as avatarUrl, company_name as companyName, is_active as isActive, is_verified as isVerified, subscription_tier as subscriptionTier, created_at as createdAt FROM users WHERE id = ?').get(auth.userId);
    return ok(res, user);
  }

  if (req.method === 'PUT') {
    const { firstName, lastName, phone, companyName } = req.body;
    db.prepare('UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone), company_name = COALESCE(?, company_name), updated_at = datetime("now") WHERE id = ?').run(firstName, lastName, phone, companyName, auth.userId);
    const user = db.prepare('SELECT id, email, first_name as firstName, last_name as lastName, role, phone, company_name as companyName, is_verified as isVerified, subscription_tier as subscriptionTier FROM users WHERE id = ?').get(auth.userId);
    return ok(res, user);
  }

  return err(res, 'Method not allowed', 405);
}
