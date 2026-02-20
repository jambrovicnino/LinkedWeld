import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { hashPassword } from '../_lib/hash.js';
import { generateAccessToken, generateRefreshToken } from '../_lib/auth.js';
import { ok, err, handleCors } from '../_lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  try {
    const { email, password, firstName, lastName, role, phone, companyName } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return err(res, 'Missing required fields');
    }

    const db = await getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return err(res, 'Email already registered', 409);

    const passwordHash = await hashPassword(password);
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const result = db.prepare(
      'INSERT INTO users (email, password_hash, first_name, last_name, role, phone, company_name, verification_code, verification_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(email, passwordHash, firstName, lastName, role, phone || null, companyName || null, verificationCode, verificationExpires);

    const userId = result.lastInsertRowid;
    const user = db.prepare(
      'SELECT id, email, first_name as firstName, last_name as lastName, role, phone, company_name as companyName, is_active as isActive, is_verified as isVerified, subscription_tier as subscriptionTier, created_at as createdAt FROM users WHERE id = ?'
    ).get(userId);

    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId, role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(userId, refreshToken, expiresAt);

    if (role === 'welder') {
      db.prepare('INSERT OR IGNORE INTO worker_profiles (user_id, trade) VALUES (?, ?)').run(userId, 'welder');
    }

    db.prepare('INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)').run(userId, 'system', 'Welcome to LinkedWeld!', 'Please verify your email to get started.');

    return ok(res, {
      user: { ...user, isVerified: false },
      tokens: { accessToken, refreshToken },
      verificationCode
    }, 201);
  } catch (e: any) {
    console.error('Register error:', e);
    return err(res, e.message || 'Registration failed', 500);
  }
}
