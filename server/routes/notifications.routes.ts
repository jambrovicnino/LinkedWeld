import { Router, Response } from 'express';
import { getDb } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
const router = Router();
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: getDb().prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50').all(req.userId) });
});
router.get('/unread-count', authenticate, (req: AuthRequest, res: Response) => {
  const r: any = getDb().prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id=? AND is_read=0').get(req.userId);
  res.json({ success: true, data: { count: r.count } });
});
router.put('/:id/read', authenticate, (req: AuthRequest, res: Response) => {
  getDb().prepare('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?').run(req.params.id, req.userId);
  res.json({ success: true });
});
router.put('/read-all', authenticate, (req: AuthRequest, res: Response) => {
  getDb().prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.userId);
  res.json({ success: true });
});
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  getDb().prepare('DELETE FROM notifications WHERE id=? AND user_id=?').run(req.params.id, req.userId);
  res.json({ success: true });
});
export default router;
