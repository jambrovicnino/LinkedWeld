import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { ok, err, handleCors } from '../_lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);
  const db = await getDb();
  return ok(res, db.prepare('SELECT * FROM expense_categories').all());
}
