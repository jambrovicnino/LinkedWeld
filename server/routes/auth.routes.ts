import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone, companyName } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      res.status(400).json({ success: false, error: 'Missing required fields' }); return;
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) { res.status(409).json({ success: false, error: 'Email already registered' }); return; }
    const passwordHash = await hashPassword(password);
    const result = db.prepare('INSERT INTO users (email, password_hash, first_name, last_name, role, phone, company_name) VALUES (?, ?, ?, ?, ?, ?, ?)').run(email, passwordHash, firstName, lastName, role, phone || null, companyName || null);
    const userId = result.lastInsertRowid as number;
    const user = db.prepare('SELECT id, email, first_name as firstName, last_name as lastName, role, phone, avatar_url as avatarUrl, company_name as companyName, is_active as isActive, subscription_tier as subscriptionTier, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?').get(userId);
    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId, role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(userId, refreshToken, expiresAt);
    if (role === 'welder') { db.prepare('INSERT OR IGNORE INTO worker_profiles (user_id, trade) VALUES (?, ?)').run(userId, 'welder'); }
    db.prepare('INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)').run(userId, 'system', 'Welcome to LinkedWeld!', 'Complete your profile to get started.');
    res.status(201).json({ success: true, data: { user, tokens: { accessToken, refreshToken } } });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const db = getDb();
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) { res.status(401).json({ success: false, error: 'Invalid credentials' }); return; }
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) { res.status(401).json({ success: false, error: 'Invalid credentials' }); return; }
    db.prepare('UPDATE users SET last_login_at = datetime("now") WHERE id = ?').run(user.id);
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, refreshToken, expiresAt);
    const safeUser = { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, phone: user.phone, avatarUrl: user.avatar_url, companyName: user.company_name, isActive: !!user.is_active, subscriptionTier: user.subscription_tier, createdAt: user.created_at, updatedAt: user.updated_at };
    res.json({ success: true, data: { user: safeUser, tokens: { accessToken, refreshToken } } });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);
    const db = getDb();
    const stored = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(refreshToken);
    if (!stored) { res.status(401).json({ success: false, error: 'Invalid refresh token' }); return; }
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    const newAccess = generateAccessToken(decoded.userId, decoded.role);
    const newRefresh = generateRefreshToken(decoded.userId, decoded.role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(decoded.userId, newRefresh, expiresAt);
    res.json({ success: true, data: { accessToken: newAccess, refreshToken: newRefresh } });
  } catch { res.status(401).json({ success: false, error: 'Invalid refresh token' }); }
});

router.post('/logout', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) getDb().prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  res.json({ success: true });
});

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = getDb().prepare('SELECT id, email, first_name as firstName, last_name as lastName, role, phone, avatar_url as avatarUrl, company_name as companyName, is_active as isActive, subscription_tier as subscriptionTier, created_at as createdAt FROM users WHERE id = ?').get(req.userId);
  res.json({ success: true, data: user });
});

router.put('/me', authenticate, (req: AuthRequest, res: Response) => {
  const { firstName, lastName, phone, companyName } = req.body;
  getDb().prepare('UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone), company_name = COALESCE(?, company_name), updated_at = datetime("now") WHERE id = ?').run(firstName, lastName, phone, companyName, req.userId);
  const user = getDb().prepare('SELECT id, email, first_name as firstName, last_name as lastName, role, phone, company_name as companyName, subscription_tier as subscriptionTier FROM users WHERE id = ?').get(req.userId);
  res.json({ success: true, data: user });
});

export default router;
