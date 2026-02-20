import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';
import { ok, err, handleCors } from '../_lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  try {
    const auth = getUserFromRequest(req);
    if (!auth) return err(res, 'Not authenticated', 401);

    const { code } = req.body;
    if (!code) return err(res, 'Verification code is required');

    const db = await getDb();
    const user: any = db.prepare('SELECT id, verification_code, verification_expires_at, is_verified FROM users WHERE id = ?').get(auth.userId);
    if (!user) return err(res, 'User not found', 404);
    if (user.is_verified) return ok(res, { message: 'Already verified' });

    if (user.verification_code !== String(code)) {
      return err(res, 'Invalid verification code');
    }

    const now = new Date();
    const expires = new Date(user.verification_expires_at);
    if (now > expires) {
      return err(res, 'Verification code has expired. Please request a new one.');
    }

    db.prepare('UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires_at = NULL, updated_at = datetime("now") WHERE id = ?').run(auth.userId);

    return ok(res, { message: 'Email verified successfully', isVerified: true });
  } catch (e: any) {
    console.error('Verify error:', e);
    return err(res, e.message || 'Verification failed', 500);
  }
}
