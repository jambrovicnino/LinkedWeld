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

  if (req.method === 'PUT') {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, auth.userId);
    return ok(res, { message: 'Marked as read' });
  }

  if (req.method === 'DELETE') {
    db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(id, auth.userId);
    return ok(res, { message: 'Notification deleted' });
  }

  return err(res, 'Method not allowed', 405);
}
