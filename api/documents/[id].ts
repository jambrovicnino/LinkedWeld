import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { getUserFromRequest } from '../_lib/auth';
import { ok, err, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  if (req.method !== 'DELETE') return err(res, 'Method not allowed', 405);

  const db = await getDb();
  const { id } = req.query;
  db.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?').run(id, auth.userId);
  return ok(res, { message: 'Document deleted' });
}
