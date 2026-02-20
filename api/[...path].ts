import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_lib/db';
import { hashPassword, comparePassword } from './_lib/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getUserFromRequest } from './_lib/auth';
import { ok, err, handleCors } from './_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const pathParam = req.query.path;
  const segments = Array.isArray(pathParam) ? pathParam : pathParam ? [pathParam] : [];
  const path = '/' + segments.join('/');
  const method = req.method || 'GET';

  try {
    // ──── AUTH ────
    if (path === '/auth/register' && method === 'POST') return await handleRegister(req, res);
    if (path === '/auth/login' && method === 'POST') return await handleLogin(req, res);
    if (path === '/auth/verify' && method === 'POST') return await handleVerify(req, res);
    if (path === '/auth/me') return await handleMe(req, res, method);
    if (path === '/auth/refresh' && method === 'POST') return await handleRefresh(req, res);
    if (path === '/auth/logout' && method === 'POST') return await handleLogout(req, res);

    // ──── PROJECTS ────
    if (path === '/projects') return await handleProjects(req, res, method);
    const projectMatch = path.match(/^\/projects\/(\d+)$/);
    if (projectMatch) return await handleProjectById(req, res, method, projectMatch[1]);

    // ──── WORKERS ────
    if (path === '/workers') return await handleWorkers(req, res);
    if (path === '/workers/check-in' && method === 'POST') return await handleCheckIn(req, res);
    if (path === '/workers/check-out' && method === 'POST') return await handleCheckOut(req, res);
    const workerMatch = path.match(/^\/workers\/(\d+)$/);
    if (workerMatch) return await handleWorkerById(req, res, workerMatch[1]);

    // ──── EXPENSES ────
    if (path === '/expenses') return await handleExpenses(req, res, method);
    if (path === '/expenses/categories') return await handleExpenseCategories(res);
    const expenseMatch = path.match(/^\/expenses\/(\d+)$/);
    if (expenseMatch) return await handleExpenseById(req, res, method, expenseMatch[1]);

    // ──── DOCUMENTS ────
    if (path === '/documents') return await handleDocuments(req, res, method);
    const docMatch = path.match(/^\/documents\/(\d+)$/);
    if (docMatch && method === 'DELETE') return await handleDocumentDelete(req, res, docMatch[1]);

    // ──── NOTIFICATIONS ────
    if (path === '/notifications') return await handleNotifications(req, res);
    if (path === '/notifications/unread-count') return await handleUnreadCount(req, res);
    if (path === '/notifications/read-all' && method === 'PUT') return await handleReadAll(req, res);
    const notifMatch = path.match(/^\/notifications\/(\d+)$/);
    if (notifMatch) return await handleNotificationById(req, res, method, notifMatch[1]);

    // ──── REPORTS ────
    if (path === '/reports/dashboard-summary') return await handleDashboardSummary(req, res);

    // ──── ADMIN ────
    if (path === '/admin/stats') return await handleAdminStats(req, res);
    if (path === '/admin/users') return await handleAdminUsers(req, res, method);

    return err(res, `Not found: ${method} /api${path}`, 404);
  } catch (e: any) {
    console.error('API error:', e);
    return err(res, e.message || 'Internal server error', 500);
  }
}

// ──────────── AUTH ────────────

async function handleRegister(req: VercelRequest, res: VercelResponse) {
  const { email, password, firstName, lastName, role, phone, companyName } = req.body;
  if (!email || !password || !firstName || !lastName || !role) return err(res, 'Missing required fields');

  const db = getDb();
  const existing = db.findOne('users', (u) => u.email === email);
  if (existing) return err(res, 'Email already registered', 409);

  const password_hash = await hashPassword(password);
  const verification_code = String(Math.floor(100000 + Math.random() * 900000));
  const verification_expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const result = db.insert('users', {
    email, password_hash, first_name: firstName, last_name: lastName, role,
    phone: phone || null, company_name: companyName || null,
    verification_code, verification_expires_at,
    is_active: 1, is_verified: 0, subscription_tier: 'free', avatar_url: null, last_login_at: null,
  });

  const userId = result.lastInsertRowid;
  const user = db.findOne('users', (u) => u.id === userId);

  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);
  db.insert('refresh_tokens', { user_id: userId, token: refreshToken, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });

  if (role === 'welder') {
    db.insert('worker_profiles', { user_id: userId, trade: 'welder', experience_years: 0, availability: 'available' });
  }

  db.insert('notifications', { user_id: userId, type: 'system', title: 'Welcome to LinkedWeld!', message: 'Please verify your email to get started.', is_read: 0 });

  const safeUser = {
    id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name,
    role: user.role, phone: user.phone, companyName: user.company_name,
    isActive: !!user.is_active, isVerified: false, subscriptionTier: user.subscription_tier, createdAt: user.created_at,
  };

  return ok(res, { user: safeUser, tokens: { accessToken, refreshToken }, verificationCode: verification_code }, 201);
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  const { email, password } = req.body;
  if (!email || !password) return err(res, 'Email and password are required');

  const db = getDb();
  const user = db.findOne('users', (u) => u.email === email);
  if (!user) return err(res, 'Invalid credentials', 401);

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) return err(res, 'Invalid credentials', 401);

  db.update('users', (u) => u.id === user.id, { last_login_at: new Date().toISOString() });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);
  db.insert('refresh_tokens', { user_id: user.id, token: refreshToken, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });

  const safeUser = {
    id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name,
    role: user.role, phone: user.phone, avatarUrl: user.avatar_url, companyName: user.company_name,
    isActive: !!user.is_active, isVerified: !!user.is_verified, subscriptionTier: user.subscription_tier, createdAt: user.created_at,
  };

  return ok(res, { user: safeUser, tokens: { accessToken, refreshToken } });
}

async function handleVerify(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);

  const { code } = req.body;
  if (!code) return err(res, 'Verification code is required');

  const db = getDb();
  const user = db.findOne('users', (u) => u.id === auth.userId);
  if (!user) return err(res, 'User not found', 404);
  if (user.is_verified) return ok(res, { message: 'Already verified' });

  if (user.verification_code !== String(code)) return err(res, 'Invalid verification code');

  if (new Date() > new Date(user.verification_expires_at)) return err(res, 'Verification code has expired.');

  db.update('users', (u) => u.id === auth.userId, { is_verified: 1, verification_code: null, verification_expires_at: null });

  return ok(res, { message: 'Email verified successfully', isVerified: true });
}

async function handleMe(req: VercelRequest, res: VercelResponse, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();

  if (method === 'GET') {
    const user = db.findOne('users', (u) => u.id === auth.userId);
    if (!user) return err(res, 'User not found', 404);
    return ok(res, {
      id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name,
      role: user.role, phone: user.phone, avatarUrl: user.avatar_url, companyName: user.company_name,
      isActive: !!user.is_active, isVerified: !!user.is_verified, subscriptionTier: user.subscription_tier, createdAt: user.created_at,
    });
  }

  if (method === 'PUT') {
    const { firstName, lastName, phone, companyName } = req.body;
    const updates: any = {};
    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (phone) updates.phone = phone;
    if (companyName) updates.company_name = companyName;
    db.update('users', (u) => u.id === auth.userId, updates);
    const user = db.findOne('users', (u) => u.id === auth.userId);
    return ok(res, { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, phone: user.phone, companyName: user.company_name, isVerified: !!user.is_verified, subscriptionTier: user.subscription_tier });
  }

  return err(res, 'Method not allowed', 405);
}

async function handleRefresh(req: VercelRequest, res: VercelResponse) {
  const { refreshToken } = req.body;
  if (!refreshToken) return err(res, 'Refresh token required', 401);
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const db = getDb();
    const stored = db.findOne('refresh_tokens', (t) => t.token === refreshToken);
    if (!stored) return err(res, 'Invalid refresh token', 401);
    db.remove('refresh_tokens', (t) => t.token === refreshToken);
    const newAccess = generateAccessToken(decoded.userId, decoded.role);
    const newRefresh = generateRefreshToken(decoded.userId, decoded.role);
    db.insert('refresh_tokens', { user_id: decoded.userId, token: newRefresh, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });
    return ok(res, { accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    return err(res, 'Invalid refresh token', 401);
  }
}

async function handleLogout(req: VercelRequest, res: VercelResponse) {
  const { refreshToken } = req.body;
  if (refreshToken) { const db = getDb(); db.remove('refresh_tokens', (t) => t.token === refreshToken); }
  return ok(res, { message: 'Logged out' });
}

// ──────────── PROJECTS ────────────

async function handleProjects(req: VercelRequest, res: VercelResponse, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();

  if (method === 'GET') {
    const { page = '1', limit = '20', status, search } = req.query as any;
    let all = db.findAll('projects');
    if (status && status !== 'all') all = all.filter((p) => p.status === status);
    if (search) all = all.filter((p) => (p.title || '').toLowerCase().includes(search.toLowerCase()) || (p.location || '').toLowerCase().includes(search.toLowerCase()));
    all.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
    const total = all.length;
    const pg = parseInt(page); const lim = parseInt(limit);
    const projects = all.slice((pg - 1) * lim, pg * lim);
    return ok(res, { projects, meta: { page: pg, limit: lim, total, totalPages: Math.ceil(total / lim) } });
  }

  if (method === 'POST') {
    const { title, description, status: s, priority, budget, currency, location, startDate, endDate } = req.body;
    const result = db.insert('projects', { title, description, client_id: auth.userId, status: s || 'draft', priority: priority || 'medium', budget, currency: currency || 'EUR', location, start_date: startDate, end_date: endDate, progress: 0 });
    const project = db.findOne('projects', (p) => p.id === result.lastInsertRowid);
    return ok(res, project, 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleProjectById(req: VercelRequest, res: VercelResponse, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const numId = parseInt(id);

  if (method === 'GET') {
    const project = db.findOne('projects', (p) => p.id === numId);
    if (!project) return err(res, 'Project not found', 404);
    return ok(res, project);
  }
  if (method === 'PUT') {
    const { title, description, status, priority, budget, location, startDate, endDate, progress } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (budget !== undefined) updates.budget = budget;
    if (location !== undefined) updates.location = location;
    if (startDate !== undefined) updates.start_date = startDate;
    if (endDate !== undefined) updates.end_date = endDate;
    if (progress !== undefined) updates.progress = progress;
    db.update('projects', (p) => p.id === numId, updates);
    return ok(res, db.findOne('projects', (p) => p.id === numId));
  }
  if (method === 'DELETE') {
    db.update('projects', (p) => p.id === numId, { status: 'cancelled' });
    return ok(res, { message: 'Project cancelled' });
  }
  return err(res, 'Method not allowed', 405);
}

// ──────────── WORKERS ────────────

async function handleWorkers(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);
  const db = getDb();
  const welders = db.findAll('users', (u) => u.role === 'welder' && u.is_active);
  const result = welders.map((u) => {
    const wp = db.findOne('worker_profiles', (w) => w.user_id === u.id);
    return { id: u.id, firstName: u.first_name, lastName: u.last_name, email: u.email, avatarUrl: u.avatar_url, trade: wp?.trade, experienceYears: wp?.experience_years, hourlyRate: wp?.hourly_rate, skills: wp?.skills ? JSON.parse(wp.skills) : [], availability: wp?.availability, location: wp?.location };
  });
  return ok(res, result);
}

async function handleWorkerById(req: VercelRequest, res: VercelResponse, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const u = db.findOne('users', (u) => u.id === parseInt(id));
  if (!u) return err(res, 'Worker not found', 404);
  const wp = db.findOne('worker_profiles', (w) => w.user_id === u.id);
  return ok(res, { id: u.id, firstName: u.first_name, lastName: u.last_name, email: u.email, ...wp });
}

async function handleCheckIn(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const { projectId, latitude, longitude, notes } = req.body;
  const result = db.insert('attendance_records', { worker_id: auth.userId, project_id: projectId, check_in: new Date().toISOString(), check_in_lat: latitude, check_in_lng: longitude, notes });
  return ok(res, { id: result.lastInsertRowid }, 201);
}

async function handleCheckOut(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const { latitude, longitude } = req.body;
  const records = db.findAll('attendance_records', (r) => r.worker_id === auth.userId && !r.check_out).sort((a: any, b: any) => (b.check_in || '').localeCompare(a.check_in || ''));
  if (!records.length) return err(res, 'No active check-in found', 404);
  const record = records[0];
  const hours = (Date.now() - new Date(record.check_in).getTime()) / 3600000;
  db.update('attendance_records', (r) => r.id === record.id, { check_out: new Date().toISOString(), check_out_lat: latitude, check_out_lng: longitude, hours_worked: Math.round(hours * 100) / 100 });
  return ok(res, { hoursWorked: Math.round(hours * 100) / 100 });
}

// ──────────── EXPENSES ────────────

async function handleExpenses(req: VercelRequest, res: VercelResponse, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();

  if (method === 'GET') {
    const expenses = db.findAll('expenses', (e) => e.user_id === auth.userId).sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
    const result = expenses.map((e) => {
      const cat = db.findOne('expense_categories', (c) => c.id === e.category_id);
      return { ...e, categoryName: cat?.name };
    });
    return ok(res, result);
  }

  if (method === 'POST') {
    const { projectId, categoryId, amount, currency, description, expenseDate, notes } = req.body;
    const result = db.insert('expenses', { user_id: auth.userId, project_id: projectId, category_id: categoryId, amount, currency: currency || 'EUR', description, expense_date: expenseDate || new Date().toISOString(), notes, status: 'pending' });
    return ok(res, { id: result.lastInsertRowid }, 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleExpenseCategories(res: VercelResponse) {
  return ok(res, getDb().findAll('expense_categories'));
}

async function handleExpenseById(req: VercelRequest, res: VercelResponse, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const numId = parseInt(id);

  if (method === 'GET') {
    const e = db.findOne('expenses', (e) => e.id === numId);
    if (!e) return err(res, 'Expense not found', 404);
    const cat = db.findOne('expense_categories', (c) => c.id === e.category_id);
    return ok(res, { ...e, categoryName: cat?.name });
  }

  if (method === 'PUT') {
    db.update('expenses', (e) => e.id === numId, { status: req.body.status, approved_by: auth.userId, approved_at: new Date().toISOString() });
    return ok(res, { message: 'Expense updated' });
  }

  return err(res, 'Method not allowed', 405);
}

// ──────────── DOCUMENTS ────────────

async function handleDocuments(req: VercelRequest, res: VercelResponse, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();

  if (method === 'GET') {
    return ok(res, db.findAll('documents', (d) => d.user_id === auth.userId).sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || '')));
  }

  if (method === 'POST') {
    const { title, category, projectId, expiryDate, fileName, filePath, fileSize, mimeType } = req.body;
    const result = db.insert('documents', { user_id: auth.userId, project_id: projectId, title, file_name: fileName || 'uploaded-file', file_path: filePath || '/uploads/placeholder', file_size: fileSize || 0, mime_type: mimeType || 'application/octet-stream', category: category || 'other', expiry_date: expiryDate, is_shared: 0 });
    return ok(res, { id: result.lastInsertRowid }, 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleDocumentDelete(req: VercelRequest, res: VercelResponse, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  getDb().remove('documents', (d) => d.id === parseInt(id) && d.user_id === auth.userId);
  return ok(res, { message: 'Document deleted' });
}

// ──────────── NOTIFICATIONS ────────────

async function handleNotifications(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  return ok(res, getDb().findAll('notifications', (n) => n.user_id === auth.userId).sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 50));
}

async function handleUnreadCount(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  return ok(res, { count: getDb().count('notifications', (n) => n.user_id === auth.userId && !n.is_read) });
}

async function handleReadAll(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  getDb().update('notifications', (n) => n.user_id === auth.userId, { is_read: 1 });
  return ok(res, { message: 'All marked as read' });
}

async function handleNotificationById(req: VercelRequest, res: VercelResponse, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const numId = parseInt(id);
  if (method === 'PUT') { db.update('notifications', (n) => n.id === numId && n.user_id === auth.userId, { is_read: 1 }); return ok(res, { message: 'Marked as read' }); }
  if (method === 'DELETE') { db.remove('notifications', (n) => n.id === numId && n.user_id === auth.userId); return ok(res, { message: 'Notification deleted' }); }
  return err(res, 'Method not allowed', 405);
}

// ──────────── REPORTS ────────────

async function handleDashboardSummary(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  return ok(res, {
    totalProjects: db.count('projects'),
    activeProjects: db.count('projects', (p) => p.status === 'in_progress'),
    totalWorkers: db.count('users', (u) => u.role === 'welder'),
    totalExpenses: db.sum('expenses', 'amount'),
    pendingExpenses: db.count('expenses', (e) => e.status === 'pending'),
    totalRevenue: db.sum('projects', 'budget'),
  });
}

// ──────────── ADMIN ────────────

async function handleAdminStats(req: VercelRequest, res: VercelResponse) {
  const auth = getUserFromRequest(req);
  if (!auth || auth.role !== 'admin') return err(res, 'Admin access required', 403);
  const db = getDb();
  return ok(res, { totalUsers: db.count('users'), activeProjects: db.count('projects', (p) => p.status !== 'cancelled'), companies: db.countDistinct('users', 'company_name', (u) => !!u.company_name) });
}

async function handleAdminUsers(req: VercelRequest, res: VercelResponse, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth || auth.role !== 'admin') return err(res, 'Admin access required', 403);
  const db = getDb();
  if (method === 'GET') {
    return ok(res, db.findAll('users').map((u) => ({ id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, role: u.role, isActive: !!u.is_active, subscriptionTier: u.subscription_tier, createdAt: u.created_at })));
  }
  if (method === 'PUT') {
    const { userId, role, isActive } = req.body;
    const updates: any = {};
    if (role) updates.role = role;
    if (isActive !== undefined) updates.is_active = isActive ? 1 : 0;
    db.update('users', (u) => u.id === userId, updates);
    return ok(res, { message: 'User updated' });
  }
  return err(res, 'Method not allowed', 405);
}
