import { Router, Response } from 'express';
import { getDb } from '../db.js';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.js';
const router = Router();
router.get('/stats', authenticate, requireRole('admin'), (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const u = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  const p = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as any).c;
  const r = db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();
  res.json({ success: true, data: { totalUsers: u, totalProjects: p, usersByRole: r } });
});
router.get('/users', authenticate, requireRole('admin'), (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: getDb().prepare('SELECT id,email,first_name as firstName,last_name as lastName,role,is_active as isActive,subscription_tier as subscriptionTier,created_at as createdAt FROM users ORDER BY created_at DESC').all() });
});
router.put('/users/:id/role', authenticate, requireRole('admin'), (req: AuthRequest, res: Response) => {
  getDb().prepare('UPDATE users SET role=?,updated_at=datetime("now") WHERE id=?').run(req.body.role, req.params.id);
  res.json({ success: true });
});
router.put('/users/:id/status', authenticate, requireRole('admin'), (req: AuthRequest, res: Response) => {
  getDb().prepare('UPDATE users SET is_active=?,updated_at=datetime("now") WHERE id=?').run(req.body.isActive?1:0, req.params.id);
  res.json({ success: true });
});
export default router;
