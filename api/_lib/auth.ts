import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'linkedweld-dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'linkedweld-refresh-secret-change';

export interface TokenPayload {
  userId: number;
  role: string;
}

export function generateAccessToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}

export function getUserFromRequest(req: any): TokenPayload | null {
  const authHeader = req.headers?.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}
