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
  const workers = db.prepare('SELECT u.id, u.first_name as firstName, u.last_name as lastName, u.email, u.avatar_url as avatarUrl, wp.trade, wp.experience_years as experienceYears, wp.hourly_rate as hourlyRate, wp.skills, wp.availability, wp.location FROM users u LEFT JOIN worker_profiles wp ON u.id = wp.user_id WHERE u.role = "welder" AND u.is_active = 1').all();
  return ok(res, workers.map((w: any) => ({ ...w, skills: w.skills ? JSON.parse(w.skills) : [] })));
}
