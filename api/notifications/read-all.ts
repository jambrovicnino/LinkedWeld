import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { getUserFromRequest } from '../_lib/auth';
import { ok, err, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  if (req.method !== 'PUT') return err(res, 'Method not allowed', 405);

  const db = await getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(auth.userId);
  return ok(res, { message: 'All marked as read' });
}
