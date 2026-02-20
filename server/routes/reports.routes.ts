import { Router, Response } from 'express';
import { getDb } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
const router = Router();
router.get('/dashboard-summary', authenticate, (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const p = (db.prepare('SELECT COUNT(*) as c FROM projects WHERE status IN ("open","in_progress")').get() as any).c;
  const w = (db.prepare('SELECT COUNT(*) as c FROM users WHERE role="welder" AND is_active=1').get() as any).c;
  const e = (db.prepare('SELECT COUNT(*) as c FROM expenses WHERE status="pending"').get() as any).c;
  res.json({ success: true, data: { activeProjects: p, totalWorkers: w, pendingExpenses: e, expiringCertifications: 0 } });
});
export default router;
