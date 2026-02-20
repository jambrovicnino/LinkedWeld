import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { comparePassword } from '../_lib/hash.js';
import { generateAccessToken, generateRefreshToken } from '../_lib/auth.js';
import { ok, err, handleCors } from '../_lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  try {
    const { email, password } = req.body;
    if (!email || !password) return err(res, 'Email and password are required');

    const db = await getDb();
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return err(res, 'Invalid credentials', 401);

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) return err(res, 'Invalid credentials', 401);

    db.prepare('UPDATE users SET last_login_at = datetime("now") WHERE id = ?').run(user.id);

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, refreshToken, expiresAt);

    const safeUser = {
      id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name,
      role: user.role, phone: user.phone, avatarUrl: user.avatar_url, companyName: user.company_name,
      isActive: !!user.is_active, isVerified: !!user.is_verified,
      subscriptionTier: user.subscription_tier, createdAt: user.created_at
    };

    return ok(res, { user: safeUser, tokens: { accessToken, refreshToken } });
  } catch (e: any) {
    console.error('Login error:', e);
    return err(res, e.message || 'Login failed', 500);
  }
}
