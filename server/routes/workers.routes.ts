import { Router, Response } from 'express';
import { getDb } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
const router = Router();

router.get('/', authenticate, (_req: AuthRequest, res: Response) => {
  const workers = getDb().prepare('SELECT u.id, u.first_name as firstName, u.last_name as lastName, u.email, u.avatar_url as avatarUrl, wp.trade, wp.experience_years as experienceYears, wp.hourly_rate as hourlyRate, wp.skills, wp.availability, wp.location FROM users u LEFT JOIN worker_profiles wp ON u.id = wp.user_id WHERE u.role = "welder" AND u.is_active = 1').all();
  res.json({ success: true, data: workers.map((w: any) => ({ ...w, skills: w.skills ? JSON.parse(w.skills) : [] })) });
});

router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const worker = getDb().prepare('SELECT u.id, u.first_name as firstName, u.last_name as lastName, u.email, wp.* FROM users u LEFT JOIN worker_profiles wp ON u.id = wp.user_id WHERE u.id = ?').get(req.params.id);
  if (!worker) { res.status(404).json({ success: false, error: 'Worker not found' }); return; }
  res.json({ success: true, data: worker });
});

router.post('/:id/check-in', authenticate, (req: AuthRequest, res: Response) => {
  const { projectId, latitude, longitude, notes } = req.body;
  const result = getDb().prepare('INSERT INTO attendance_records (worker_id, project_id, check_in, check_in_lat, check_in_lng, notes) VALUES (?, ?, datetime("now"), ?, ?, ?)').run(req.userId, projectId, latitude, longitude, notes);
  res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});

router.post('/:id/check-out', authenticate, (req: AuthRequest, res: Response) => {
  const { latitude, longitude } = req.body;
  const record: any = getDb().prepare('SELECT * FROM attendance_records WHERE worker_id = ? AND check_out IS NULL ORDER BY check_in DESC LIMIT 1').get(req.userId);
  if (!record) { res.status(404).json({ success: false, error: 'No active check-in found' }); return; }
  const checkIn = new Date(record.check_in);
  const hours = (Date.now() - checkIn.getTime()) / (1000 * 60 * 60);
  getDb().prepare('UPDATE attendance_records SET check_out = datetime("now"), check_out_lat = ?, check_out_lng = ?, hours_worked = ? WHERE id = ?').run(latitude, longitude, Math.round(hours * 100) / 100, record.id);
  res.json({ success: true });
});

export default router;
