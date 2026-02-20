import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { getUserFromRequest } from '../_lib/auth.js';
import { ok, err, handleCors } from '../_lib/response.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();

  if (req.method === 'GET') {
    const { page = '1', limit = '20', status, search } = req.query as any;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1';
    const params: any[] = [];
    if (status && status !== 'all') { where += ' AND p.status = ?'; params.push(status); }
    if (search) { where += ' AND (p.title LIKE ? OR p.location LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    const total = (db.prepare(`SELECT COUNT(*) as count FROM projects p WHERE ${where}`).get(...params) as any)?.count || 0;
    const projects = db.prepare(`SELECT p.* FROM projects p WHERE ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);
    return ok(res, { projects, meta: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  }

  if (req.method === 'POST') {
    const { title, description, status: s, priority, budget, currency, location, startDate, endDate } = req.body;
    const result = db.prepare('INSERT INTO projects (title, description, client_id, status, priority, budget, currency, location, start_date, end_date) VALUES (?,?,?,?,?,?,?,?,?,?)').run(title, description, auth.userId, s || 'draft', priority || 'medium', budget, currency || 'EUR', location, startDate, endDate);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    return ok(res, project, 201);
  }

  return err(res, 'Method not allowed', 405);
}
