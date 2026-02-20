import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';
import { ok, err, handleCors } from '../_lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const db = await getDb();
  const { projectId, latitude, longitude, notes } = req.body;
  const result = db.prepare('INSERT INTO attendance_records (worker_id, project_id, check_in, check_in_lat, check_in_lng, notes) VALUES (?, ?, datetime("now"), ?, ?, ?)').run(auth.userId, projectId, latitude, longitude, notes);
  return ok(res, { id: result.lastInsertRowid }, 201);
}
