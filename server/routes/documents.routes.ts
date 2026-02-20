import { Router, Response } from 'express';
import { getDb } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
const router = Router();
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: getDb().prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC').all(req.userId) });
});
router.post('/', authenticate, upload.single('file'), (req: AuthRequest, res: Response) => {
  const { title, projectId, category, expiryDate } = req.body;
  const file = req.file;
  if (!file) { res.status(400).json({ success: false, error: 'No file uploaded' }); return; }
  const result = getDb().prepare('INSERT INTO documents (user_id,project_id,title,file_name,file_path,file_size,mime_type,category,expiry_date) VALUES (?,?,?,?,?,?,?,?,?)').run(req.userId, projectId, title, file.originalname, file.path, file.size, file.mimetype, category||'other', expiryDate);
  res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  getDb().prepare('DELETE FROM documents WHERE id=? AND user_id=?').run(req.params.id, req.userId);
  res.json({ success: true });
});
export default router;
