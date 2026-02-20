import { Router, Response } from 'express';
import { getDb } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
const router = Router();

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { page = '1', limit = '20', status, search } = req.query as any;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let where = '1=1';
  const params: any[] = [];
  if (status && status !== 'all') { where += ' AND p.status = ?'; params.push(status); }
  if (search) { where += ' AND (p.title LIKE ? OR p.location LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  const total = (db.prepare(`SELECT COUNT(*) as count FROM projects p WHERE ${where}`).get(...params) as any).count;
  const projects = db.prepare(`SELECT p.* FROM projects p WHERE ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);
  res.json({ success: true, data: projects, meta: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
});

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { title, description, status, priority, budget, currency, location, startDate, endDate } = req.body;
  const result = getDb().prepare('INSERT INTO projects (title, description, client_id, status, priority, budget, currency, location, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(title, description, req.userId, status || 'draft', priority || 'medium', budget, currency || 'EUR', location, startDate, endDate);
  const project = getDb().prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: project });
});

router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const project = getDb().prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
  res.json({ success: true, data: project });
});

router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { title, description, status, priority, budget, location, startDate, endDate, progress } = req.body;
  getDb().prepare('UPDATE projects SET title=COALESCE(?,title), description=COALESCE(?,description), status=COALESCE(?,status), priority=COALESCE(?,priority), budget=COALESCE(?,budget), location=COALESCE(?,location), start_date=COALESCE(?,start_date), end_date=COALESCE(?,end_date), progress=COALESCE(?,progress), updated_at=datetime("now") WHERE id=?').run(title, description, status, priority, budget, location, startDate, endDate, progress, req.params.id);
  const project = getDb().prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: project });
});

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  getDb().prepare('UPDATE projects SET status = "cancelled", updated_at = datetime("now") WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
