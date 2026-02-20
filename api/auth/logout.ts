import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { ok, err, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const { refreshToken } = req.body;
  if (refreshToken) {
    const db = await getDb();
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  }
  return ok(res, { message: 'Logged out' });
}
