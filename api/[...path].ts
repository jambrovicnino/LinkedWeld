import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_lib/db';
import { hashPassword, comparePassword } from './_lib/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getUserFromRequest } from './_lib/auth';
import { ok, err, handleCors } from './_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // Parse the path from the catch-all parameter
  const pathParam = req.query.path;
  const segments = Array.isArray(pathParam) ? pathParam : pathParam ? [pathParam] : [];
  const path = '/' + segments.join('/');
  const method = req.method || 'GET';

  try {
    // ──── AUTH ROUTES ────
    if (path === '/auth/register' && method === 'POST') {
      return await handleRegister(req, res);
    }
    if (path === '/auth/login' && method === 'POST') {
      return await handleLogin(req, res);
    }
    if (path === '/auth/verify' && method === 'POST') {
      return await handleVerify(req, res);
    }
    if (path === '/auth/me') {
      return await handleMe(req, res, method);
    }
    if (path === '/auth/refresh' && method === 'POST') {
      return await handleRefresh(req, res);
    }
    if (path === '/auth/logout' && method === 'POST') {
      return await handleLogout(req, res);
    }

    // ──── PROJECT ROUTES ────
    if (path === '/projects') {
      return await handleProjects(req, res, method);
    }
    if (path.match(/^\/projects\/\d+$/)) {
      const id = path.split('/')[2];
      return await handleProjectById(req, res, method, id);
    }

    // ──── WORKER ROUTES ────
    if (path === '/workers') {
      return await handleWorkers(req, res);
    }
    if (path === '/workers/check-in' && method === 'POST') {
      return await handleCheckIn(req, res);
    }
    if (path === '/workers/check-out' && method === 'POST') {
      return await handleCheckOut(req, res);
    }
    if (path.match(/^\/workers\/\d+$/)) {
      const id = path.split('/')[2];
      return await handleWorkerById(req, res, id);
    }

    // ──── EXPENSE ROUTES ────
    if (path === '/expenses') {
      return await handleExpenses(req, res, method);
    }
    if (path === '/expenses/categories' && method === 'GET') {
      return await handleExpenseCategories(req, res);
    }
    if (path.match(/^\/expenses\/\d+$/)) {
      const id = path.split('/')[2];
      return await handleExpenseById(req, res, method, id);
    }

    // ──── DOCUMENT ROUTES ────
    if (path === '/documents') {
      return await handleDocuments(req, res, method);
    }
    if (path.match(/^\/documents\/\d+$/) && method === 'DELETE') {
      const id = path.split('/')[2];
      return await handleDocumentDelete(req, res, id);
    }

    // ──── NOTIFICATION ROUTES ────
    if (path === '/notifications') {
      return await handleNotifications(req, res);
    }
    if (path === '/notifications/unread-count' && method === 'GET') {
      return await handleUnreadCount(req, res);
    }
    if (path === '/notifications/read-all' && method === 'PUT') {
      return await handleReadAll(req, res);
    }
    if (path.match(/^\/notifications\/\d+$/)) {
      const id = path.split('/')[2];
      return await handleNotificationById(req, res, method, id);
    }

    // ──── REPORT ROUTES ────
    if (path === '/reports/dashboard-summary' && method === 'GET') {
      return await handleDashboardSummary(req, res);
    }

    // ──── ADMIN ROUTES ────
    if (path === '/admin/stats' && method === 'GET') {
      return await handleAdminStats(req, res);
    }
    if (path === '/admin/users') {
      return await handleAdminUsers(req, res, method);
    }

    return err(res, `Route not found: ${method} /api${path}`, 404);
  } catch (e: any) {
    console.error('API error:', e);
    return err(res, e.message || 'Internal server error', 500);
  }
}

// ──────────────── AUTH HANDLERS ────────────────

async function handleRegister(req: VercelRequest, res: VercelResponse) {
  const { email, password, firstName, lastName, role, phone, companyName } = req.body;
  if (!email || !password || !firstName || !lastName || !role) {
    return err(res, 'Missing required fields');
  }

  const db = await getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return err(res, 'Email already registered', 409);

  const passwordHash = await hashPassword(password);
  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  const verificationExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const result = db.prepare(
    'INSERT INTO users (email, password_hash, first_name, last_name, role, phone, company_name, verification_code, verification_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(email, passwordHash, firstName, lastName, role, phone || null, companyName || null, verificationCode, verificationExpires);

  const userId = result.lastInsertRowid;
  const user = db.prepare(
    'SELECT id, email, first_name as firstName, last_name as lastName, role, phone, company_name as companyName, is_active as isActive, is_verified as isVerified, subscription_tier as subscriptionTier, created_at as createdAt FROM users WHERE id = ?'
  ).get(userId);

  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(userId, refreshToken, expiresAt);

  if (role === 'welder') {
    db.prepare('INSERT OR IGNORE INTO worker_profiles (user_id, trade) VALUES (?, ?)').run(userId, 'welder');
  }

  db.prepare('INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)').run(userId, 'system', 'Welcome to LinkedWeld!', 'Please verify your email to get started.');

  return ok(res, {
    user: { ...user, isVerified: false },
    tokens: { accessToken, refreshToken },
    verificationCode
  }, 201);
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  const { email, password } = req.body;
  if (!email || !password) return err(res, 'Email and password are required');

  const db = await getDb();
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return err(res, 'Invalid credentials', 401);

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) return err(res, 'Invalid credentials', 401);

  db.prepare('UPDATE users SET last_login_at = datetime("now") WHERE id = ?').run(user.id);

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(user.id, refreshToken, expiresAt);

  const safeUser = {
    id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name,
    role: user.role, phone: user.phone, avatarUrl: user.avatar_url, companyName: user.company_name,
    isActive: !!user.is_active, isVerified: !!user.is_verified,
    subscriptionTier: user.subscription_tier, createdAt: user.created_at
  };

  return ok(res, { user: safeUser, tokens: { accessToken, refreshToken } });
}

async function handleVerify(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);

  const { code } = req.body;
  if (!code) return err(res, 'Verification code is required');

  const db = await getDb();
  const user: any = db.prepare('SELECT id, verification_code, verification_expires_at, is_verified FROM users WHERE id = ?').get(auth.userId);
  if (!user) return err(res, 'User not found', 404);
  if (user.is_verified) return ok(res, { message: 'Already verified' });

  if (user.verification_code !== String(code)) {
    return err(res, 'Invalid verification code');
  }

  const now = new Date();
  const expires = new Date(user.verification_expires_at);
  if (now > expires) {
    return err(res, 'Verification code has expired. Please request a new one.');
  }

  db.prepare('UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires_at = NULL, updated_at = datetime("now") WHERE id = ?').run(auth.userId);

  return ok(res, { message: 'Email verified successfully', isVerified: true });
}

async function handleMe(req: VercelRequest, res: VercelResponse, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();

  if (method === 'GET') {
    const user = db.prepare('SELECT id, email, first_name as firstName, last_name as lastName, role, phone, avatar_url as avatarUrl, company_name as companyName, is_active as isActive, is_verified as isVerified, subscription_tier as subscriptionTier, created_at as createdAt FROM users WHERE id = ?').get(auth.userId);
    return ok(res, user);
  }

  if (method === 'PUT') {
    const { firstName, lastName, phone, companyName } = req.body;
    db.prepare('UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone), company_name = COALESCE(?, company_name), updated_at = datetime("now") WHERE id = ?').run(firstName, lastName, phone, companyName, auth.userId);
    const user = db.prepare('SELECT id, email, first_name as firstName, last_name as lastName, role, phone, company_name as companyName, is_verified as isVerified, subscription_tier as subscriptionTier FROM users WHERE id = ?').get(auth.userId);
    return ok(res, user);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleRefresh(req: VercelRequest, res: VercelResponse) {
  const { refreshToken } = req.body;
  if (!refreshToken) return err(res, 'Refresh token required', 401);

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const db = await getDb();
    const stored = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(refreshToken);
    if (!stored) return err(res, 'Invalid refresh token', 401);

    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    const newAccess = generateAccessToken(decoded.userId, decoded.role);
    const newRefresh = generateRefreshToken(decoded.userId, decoded.role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(decoded.userId, newRefresh, expiresAt);

    return ok(res, { accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    return err(res, 'Invalid refresh token', 401);
  }
}

async function handleLogout(req: VercelRequest, res: VercelResponse) {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const db = await getDb();
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  }
  return ok(res, { message: 'Logged out' });
}

// ──────────────── PROJECT HANDLERS ────────────────

async function handleProjects(req: VercelRequest, res: VercelResponse, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();

  if (method === 'GET') {
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

  if (method === 'POST') {
    const { title, description, status: s, priority, budget, currency, location, startDate, endDate } = req.body;
    const result = db.prepare('INSERT INTO projects (title, description, client_id, status, priority, budget, currency, location, start_date, end_date) VALUES (?,?,?,?,?,?,?,?,?,?)').run(title, description, auth.userId, s || 'draft', priority || 'medium', budget, currency || 'EUR', location, startDate, endDate);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    return ok(res, project, 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleProjectById(req: VercelRequest, res: VercelResponse, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();

  if (method === 'GET') {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) return err(res, 'Project not found', 404);
    return ok(res, project);
  }

  if (method === 'PUT') {
    const { title, description, status, priority, budget, location, startDate, endDate, progress } = req.body;
    db.prepare('UPDATE projects SET title=COALESCE(?,title), description=COALESCE(?,description), status=COALESCE(?,status), priority=COALESCE(?,priority), budget=COALESCE(?,budget), location=COALESCE(?,location), start_date=COALESCE(?,start_date), end_date=COALESCE(?,end_date), progress=COALESCE(?,progress), updated_at=datetime("now") WHERE id=?').run(title, description, status, priority, budget, location, startDate, endDate, progress, id);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    return ok(res, project);
  }

  if (method === 'DELETE') {
    db.prepare('UPDATE projects SET status = "cancelled", updated_at = datetime("now") WHERE id = ?').run(id);
    return ok(res, { message: 'Project cancelled' });
  }

  return err(res, 'Method not allowed', 405);
}

// ──────────────── WORKER HANDLERS ────────────────

async function handleWorkers(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const db = await getDb();
  const workers = db.prepare('SELECT u.id, u.first_name as firstName, u.last_name as lastName, u.email, u.avatar_url as avatarUrl, wp.trade, wp.experience_years as experienceYears, wp.hourly_rate as hourlyRate, wp.skills, wp.availability, wp.location FROM users u LEFT JOIN worker_profiles wp ON u.id = wp.user_id WHERE u.role = "welder" AND u.is_active = 1').all();
  return ok(res, workers.map((w: any) => ({ ...w, skills: w.skills ? JSON.parse(w.skills) : [] })));
}

async function handleWorkerById(req: VercelRequest, res: VercelResponse, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const db = await getDb();
  const worker = db.prepare('SELECT u.id, u.first_name as firstName, u.last_name as lastName, u.email, wp.* FROM users u LEFT JOIN worker_profiles wp ON u.id = wp.user_id WHERE u.id = ?').get(id);
  if (!worker) return err(res, 'Worker not found', 404);
  return ok(res, worker);
}

async function handleCheckIn(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);

  const db = await getDb();
  const { projectId, latitude, longitude, notes } = req.body;
  const result = db.prepare('INSERT INTO attendance_records (worker_id, project_id, check_in, check_in_lat, check_in_lng, notes) VALUES (?, ?, datetime("now"), ?, ?, ?)').run(auth.userId, projectId, latitude, longitude, notes);
  return ok(res, { id: result.lastInsertRowid }, 201);
}

async function handleCheckOut(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);

  const db = await getDb();
  const { latitude, longitude } = req.body;
  const record: any = db.prepare('SELECT * FROM attendance_records WHERE worker_id = ? AND check_out IS NULL ORDER BY check_in DESC LIMIT 1').get(auth.userId);
  if (!record) return err(res, 'No active check-in found', 404);

  const checkIn = new Date(record.check_in);
  const hours = (Date.now() - checkIn.getTime()) / (1000 * 60 * 60);
  db.prepare('UPDATE attendance_records SET check_out = datetime("now"), check_out_lat = ?, check_out_lng = ?, hours_worked = ? WHERE id = ?').run(latitude, longitude, Math.round(hours * 100) / 100, record.id);
  return ok(res, { hoursWorked: Math.round(hours * 100) / 100 });
}

// ──────────────── EXPENSE HANDLERS ────────────────

async function handleExpenses(req: VercelRequest, res: VercelResponse, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();

  if (method === 'GET') {
    const expenses = db.prepare('SELECT e.*, ec.name as categoryName FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id WHERE e.user_id = ? ORDER BY e.created_at DESC').all(auth.userId);
    return ok(res, expenses);
  }

  if (method === 'POST') {
    const { projectId, categoryId, amount, currency, description, expenseDate, notes } = req.body;
    const result = db.prepare('INSERT INTO expenses (user_id, project_id, category_id, amount, currency, description, expense_date, notes) VALUES (?,?,?,?,?,?,?,?)').run(auth.userId, projectId, categoryId, amount, currency || 'EUR', description, expenseDate, notes);
    return ok(res, { id: result.lastInsertRowid }, 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleExpenseCategories(req: VercelRequest, res: VercelResponse) {
  const db = await getDb();
  return ok(res, db.prepare('SELECT * FROM expense_categories').all());
}

async function handleExpenseById(req: VercelRequest, res: VercelResponse, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();

  if (method === 'GET') {
    const expense = db.prepare('SELECT e.*, ec.name as categoryName FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id WHERE e.id = ?').get(id);
    return ok(res, expense);
  }

  if (method === 'PUT') {
    db.prepare('UPDATE expenses SET status = ?, approved_by = ?, approved_at = datetime("now"), updated_at = datetime("now") WHERE id = ?').run(req.body.status, auth.userId, id);
    return ok(res, { message: 'Expense updated' });
  }

  return err(res, 'Method not allowed', 405);
}

// ──────────────── DOCUMENT HANDLERS ────────────────

async function handleDocuments(req: VercelRequest, res: VercelResponse, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();

  if (method === 'GET') {
    return ok(res, db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC').all(auth.userId));
  }

  if (method === 'POST') {
    const { title, category, projectId, expiryDate, fileName, filePath, fileSize, mimeType } = req.body;
    const result = db.prepare('INSERT INTO documents (user_id, project_id, title, file_name, file_path, file_size, mime_type, category, expiry_date) VALUES (?,?,?,?,?,?,?,?,?)').run(auth.userId, projectId, title, fileName || 'uploaded-file', filePath || '/uploads/placeholder', fileSize || 0, mimeType || 'application/octet-stream', category || 'other', expiryDate);
    return ok(res, { id: result.lastInsertRowid }, 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleDocumentDelete(req: VercelRequest, res: VercelResponse, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);

  const db = await getDb();
  db.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?').run(id, auth.userId);
  return ok(res, { message: 'Document deleted' });
}

// ──────────────── NOTIFICATION HANDLERS ────────────────

async function handleNotifications(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const db = await getDb();
  return ok(res, db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(auth.userId));
}

async function handleUnreadCount(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);

  const db = await getDb();
  const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(auth.userId) as any;
  return ok(res, { count: result?.count || 0 });
}

async function handleReadAll(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);

  const db = await getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(auth.userId);
  return ok(res, { message: 'All marked as read' });
}

async function handleNotificationById(req: VercelRequest, res: VercelResponse, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = await getDb();

  if (method === 'PUT') {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, auth.userId);
    return ok(res, { message: 'Marked as read' });
  }

  if (method === 'DELETE') {
    db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(id, auth.userId);
    return ok(res, { message: 'Notification deleted' });
  }

  return err(res, 'Method not allowed', 405);
}

// ──────────────── REPORT HANDLERS ────────────────

async function handleDashboardSummary(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);

  const db = await getDb();
  const totalProjects = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as any)?.c || 0;
  const activeProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'in_progress'").get() as any)?.c || 0;
  const totalWorkers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'welder'").get() as any)?.c || 0;
  const totalExpenses = (db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses').get() as any)?.total || 0;
  const pendingExpenses = (db.prepare("SELECT COUNT(*) as c FROM expenses WHERE status = 'pending'").get() as any)?.c || 0;
  const totalRevenue = (db.prepare('SELECT COALESCE(SUM(budget), 0) as total FROM projects').get() as any)?.total || 0;

  return ok(res, { totalProjects, activeProjects, totalWorkers, totalExpenses, pendingExpenses, totalRevenue });
}

// ──────────────── ADMIN HANDLERS ────────────────

async function handleAdminStats(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth || auth.role !== 'admin') return err(res, 'Admin access required', 403);

  const db = await getDb();
  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any)?.c || 0;
  const activeProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status != 'cancelled'").get() as any)?.c || 0;
  const companies = (db.prepare("SELECT COUNT(DISTINCT company_name) as c FROM users WHERE company_name IS NOT NULL").get() as any)?.c || 0;

  return ok(res, { totalUsers, activeProjects, companies });
}

async function handleAdminUsers(req: VercelRequest, res: VercelResponse, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth || auth.role !== 'admin') return err(res, 'Admin access required', 403);
  const db = await getDb();

  if (method === 'GET') {
    const users = db.prepare('SELECT id, email, first_name as firstName, last_name as lastName, role, is_active as isActive, subscription_tier as subscriptionTier, created_at as createdAt FROM users ORDER BY created_at DESC').all();
    return ok(res, users);
  }

  if (method === 'PUT') {
    const { userId, role, isActive } = req.body;
    if (role) db.prepare('UPDATE users SET role = ?, updated_at = datetime("now") WHERE id = ?').run(role, userId);
    if (isActive !== undefined) db.prepare('UPDATE users SET is_active = ?, updated_at = datetime("now") WHERE id = ?').run(isActive ? 1 : 0, userId);
    return ok(res, { message: 'User updated' });
  }

  return err(res, 'Method not allowed', 405);
}
