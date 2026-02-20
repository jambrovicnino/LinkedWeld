import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { getUserFromRequest } from '../_lib/auth';
import { ok, err, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();

  if (req.method === 'GET') {
    return ok(res, db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC').all(auth.userId));
  }

  if (req.method === 'POST') {
    const { title, category, projectId, expiryDate, fileName, filePath, fileSize, mimeType } = req.body;
    const result = db.prepare('INSERT INTO documents (user_id, project_id, title, file_name, file_path, file_size, mime_type, category, expiry_date) VALUES (?,?,?,?,?,?,?,?,?)').run(auth.userId, projectId, title, fileName || 'uploaded-file', filePath || '/uploads/placeholder', fileSize || 0, mimeType || 'application/octet-stream', category || 'other', expiryDate);
    return ok(res, { id: result.lastInsertRowid }, 201);
  }

  return err(res, 'Method not allowed', 405);
}
