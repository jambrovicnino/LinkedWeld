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
  const { latitude, longitude } = req.body;
  const record: any = db.prepare('SELECT * FROM attendance_records WHERE worker_id = ? AND check_out IS NULL ORDER BY check_in DESC LIMIT 1').get(auth.userId);
  if (!record) return err(res, 'No active check-in found', 404);

  const checkIn = new Date(record.check_in);
  const hours = (Date.now() - checkIn.getTime()) / (1000 * 60 * 60);
  db.prepare('UPDATE attendance_records SET check_out = datetime("now"), check_out_lat = ?, check_out_lng = ?, hours_worked = ? WHERE id = ?').run(latitude, longitude, Math.round(hours * 100) / 100, record.id);
  return ok(res, { hoursWorked: Math.round(hours * 100) / 100 });
}
