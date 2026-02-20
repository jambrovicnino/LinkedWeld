import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'linkedweld-dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'linkedweld-refresh-secret-change';
export function generateAccessToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' });
}
export function generateRefreshToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' });
}
export function verifyRefreshToken(token: string): { userId: number; role: string } {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number; role: string };
}
