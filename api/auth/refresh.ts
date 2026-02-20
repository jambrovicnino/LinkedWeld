import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../_lib/auth.js';
import { ok, err, handleCors } from '../_lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return err(res, 'Refresh token required', 401);

    const decoded = verifyRefreshToken(refreshToken);
    const db = await getDb();
    const stored = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(refreshToken);
    if (!stored) return err(res, 'Invalid refresh token', 401);

    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    const newAccess = generateAccessToken(decoded.userId, decoded.role);
    const newRefresh = generateRefreshToken(decoded.userId, decoded.role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(decoded.userId, newRefresh, expiresAt);

    return ok(res, { accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    return err(res, 'Invalid refresh token', 401);
  }
}
