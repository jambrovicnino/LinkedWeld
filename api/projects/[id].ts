import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';
import { getUserFromRequest } from '../_lib/auth';
import { ok, err, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();
  const { id } = req.query;

  if (req.method === 'GET') {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) return err(res, 'Project not found', 404);
    return ok(res, project);
  }

  if (req.method === 'PUT') {
    const { title, description, status, priority, budget, location, startDate, endDate, progress } = req.body;
    db.prepare('UPDATE projects SET title=COALESCE(?,title), description=COALESCE(?,description), status=COALESCE(?,status), priority=COALESCE(?,priority), budget=COALESCE(?,budget), location=COALESCE(?,location), start_date=COALESCE(?,start_date), end_date=COALESCE(?,end_date), progress=COALESCE(?,progress), updated_at=datetime("now") WHERE id=?').run(title, description, status, priority, budget, location, startDate, endDate, progress, id);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    return ok(res, project);
  }

  if (req.method === 'DELETE') {
    db.prepare('UPDATE projects SET status = "cancelled", updated_at = datetime("now") WHERE id = ?').run(id);
    return ok(res, { message: 'Project cancelled' });
  }

  return err(res, 'Method not allowed', 405);
}
