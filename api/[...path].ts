import { getDb } from './_lib/db';
import { hashPassword, comparePassword } from './_lib/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getUserFromRequest } from './_lib/auth';
import { ok, err, handleCors } from './_lib/response';

export default async function handler(req: any, res: any) {
  try {
    if (handleCors(req, res)) return;

    const pathParam = req.query.path;
    let segments: string[];
    if (pathParam && (Array.isArray(pathParam) ? pathParam.length > 0 : true)) {
      segments = Array.isArray(pathParam) ? pathParam : [pathParam];
    } else {
      const url = (req.url || '').split('?')[0];
      const stripped = url.replace(/^\/api\/?/, '');
      segments = stripped ? stripped.split('/') : [];
    }
    const path = '/' + segments.join('/');
    const method = req.method || 'GET';

    // ──── AUTH ────
    if (path === '/auth/register' && method === 'POST') return await handleRegister(req, res);
    if (path === '/auth/login' && method === 'POST') return await handleLogin(req, res);
    if (path === '/auth/verify' && method === 'POST') return await handleVerify(req, res);
    if (path === '/auth/me') return await handleMe(req, res, method);
    if (path === '/auth/refresh' && method === 'POST') return await handleRefresh(req, res);
    if (path === '/auth/logout' && method === 'POST') return await handleLogout(req, res);

    // ──── WORKERS ────
    if (path === '/workers') return await handleWorkers(req, res, method);
    const workerDocMatch = path.match(/^\/workers\/(\d+)\/documents$/);
    if (workerDocMatch) return await handleWorkerDocuments(req, res, method, workerDocMatch[1]);
    const workerDocIdMatch = path.match(/^\/workers\/(\d+)\/documents\/(\d+)$/);
    if (workerDocIdMatch) return await handleWorkerDocumentById(req, res, method, workerDocIdMatch[1], workerDocIdMatch[2]);
    const workerMatch = path.match(/^\/workers\/(\d+)$/);
    if (workerMatch) return await handleWorkerById(req, res, method, workerMatch[1]);

    // ──── PROJECTS ────
    if (path === '/projects') return await handleProjects(req, res, method);
    const projWorkerMatch = path.match(/^\/projects\/(\d+)\/workers$/);
    if (projWorkerMatch) return await handleProjectWorkers(req, res, method, projWorkerMatch[1]);
    const projectMatch = path.match(/^\/projects\/(\d+)$/);
    if (projectMatch) return await handleProjectById(req, res, method, projectMatch[1]);

    // ──── EXPENSES ────
    if (path === '/expenses') return await handleExpenses(req, res, method);
    if (path === '/expenses/categories') return ok(res, getDb().findAll('expense_categories'));
    if (path === '/expenses/summary') return await handleExpenseSummary(req, res);
    const expenseMatch = path.match(/^\/expenses\/(\d+)$/);
    if (expenseMatch) return await handleExpenseById(req, res, method, expenseMatch[1]);

    // ──── PIPELINE ────
    if (path === '/pipeline') return await handlePipeline(req, res, method);
    const pipeDocMatch = path.match(/^\/pipeline\/(\d+)\/documents\/(.+)$/);
    if (pipeDocMatch) return await handlePipelineDocToggle(req, res, pipeDocMatch[1], pipeDocMatch[2]);
    const pipeMatch = path.match(/^\/pipeline\/(\d+)$/);
    if (pipeMatch) return await handlePipelineById(req, res, method, pipeMatch[1]);

    // ──── DASHBOARD / ALERTS ────
    if (path === '/dashboard/summary') return await handleDashboardSummary(req, res);
    if (path === '/alerts') return await handleAlerts(req, res);

    // ──── NOTIFICATIONS ────
    if (path === '/notifications') return await handleNotifications(req, res);
    if (path === '/notifications/unread-count') return await handleUnreadCount(req, res);
    if (path === '/notifications/read-all' && method === 'PUT') return await handleReadAll(req, res);
    const notifMatch = path.match(/^\/notifications\/(\d+)$/);
    if (notifMatch) return await handleNotificationById(req, res, method, notifMatch[1]);

    return err(res, `Not found: ${method} /api${path}`, 404);
  } catch (e: any) {
    console.error('API error:', e?.stack || e?.message || e);
    return res.status(500).json({ success: false, error: String(e?.message || 'Internal server error') });
  }
}

// ──────────── AUTH ────────────

async function handleRegister(req: any, res: any) {
  const { email, password, firstName, lastName, role, phone, companyName } = req.body;
  if (!email || !password || !firstName || !lastName || !role) return err(res, 'Missing required fields');
  const db = getDb();
  if (db.findOne('users', (u) => u.email === email)) return err(res, 'Email already registered', 409);
  const password_hash = await hashPassword(password);
  const verification_code = String(Math.floor(100000 + Math.random() * 900000));
  const result = db.insert('users', {
    email, password_hash, first_name: firstName, last_name: lastName, role,
    phone: phone || null, company_name: companyName || null,
    verification_code, verification_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    is_active: 1, is_verified: 0,
  });
  const userId = result.lastInsertRowid;
  const user = db.findOne('users', (u) => u.id === userId);
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);
  db.insert('refresh_tokens', { user_id: userId, token: refreshToken, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });
  db.insert('notifications', { user_id: userId, type: 'system', title: 'Welcome to LinkedWeld Pro!', message: 'Please verify your email to get started.', is_read: 0 });
  return ok(res, {
    user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, phone: user.phone, companyName: user.company_name, isActive: true, isVerified: false, createdAt: user.created_at },
    tokens: { accessToken, refreshToken }, verificationCode: verification_code,
  }, 201);
}

async function handleLogin(req: any, res: any) {
  const { email, password } = req.body;
  if (!email || !password) return err(res, 'Email and password are required');
  const db = getDb();
  const user = db.findOne('users', (u) => u.email === email);
  if (!user) return err(res, 'Invalid credentials', 401);
  if (!(await comparePassword(password, user.password_hash))) return err(res, 'Invalid credentials', 401);
  db.update('users', (u) => u.id === user.id, { last_login_at: new Date().toISOString() });
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);
  db.insert('refresh_tokens', { user_id: user.id, token: refreshToken, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });
  return ok(res, {
    user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, phone: user.phone, companyName: user.company_name, isActive: !!user.is_active, isVerified: !!user.is_verified, createdAt: user.created_at },
    tokens: { accessToken, refreshToken },
  });
}

async function handleVerify(req: any, res: any) {
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

async function handleMe(req: any, res: any, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  if (method === 'GET') {
    const user = db.findOne('users', (u) => u.id === auth.userId);
    if (!user) return err(res, 'User not found', 404);
    return ok(res, { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, phone: user.phone, companyName: user.company_name, isActive: !!user.is_active, isVerified: !!user.is_verified, createdAt: user.created_at });
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
    return ok(res, { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, phone: user.phone, companyName: user.company_name, isVerified: !!user.is_verified });
  }
  return err(res, 'Method not allowed', 405);
}

async function handleRefresh(req: any, res: any) {
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
  } catch { return err(res, 'Invalid refresh token', 401); }
}

async function handleLogout(req: any, res: any) {
  const { refreshToken } = req.body;
  if (refreshToken) getDb().remove('refresh_tokens', (t) => t.token === refreshToken);
  return ok(res, { message: 'Logged out' });
}

// ──────────── WORKERS ────────────

function enrichWorker(db: any, w: any) {
  const project = w.current_project_id ? db.findOne('projects', (p: any) => p.id === w.current_project_id) : null;
  const trcDoc = db.findOne('worker_documents', (d: any) => d.worker_id === w.id && d.doc_type === 'trc');
  const trcDays = trcDoc?.expiry_date ? Math.ceil((new Date(trcDoc.expiry_date).getTime() - Date.now()) / 86400000) : null;
  const docCount = db.count('worker_documents', (d: any) => d.worker_id === w.id);
  return { ...w, welding_types: typeof w.welding_types === 'string' ? JSON.parse(w.welding_types) : (w.welding_types || []), currentProjectName: project?.name || null, trcExpiryDate: trcDoc?.expiry_date || null, trcDaysLeft: trcDays, docCount };
}

async function handleWorkers(req: any, res: any, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();

  if (method === 'GET') {
    const { search, status } = req.query as any;
    let workers = db.findAll('workers');
    if (status && status !== 'all') workers = workers.filter((w) => w.status === status);
    if (search) workers = workers.filter((w) => `${w.first_name} ${w.last_name}`.toLowerCase().includes(search.toLowerCase()));
    workers.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
    return ok(res, workers.map((w) => enrichWorker(db, w)));
  }

  if (method === 'POST') {
    const b = req.body;
    const result = db.insert('workers', {
      first_name: b.first_name, last_name: b.last_name, nationality: b.nationality || '',
      phone: b.phone || '', email: b.email || '', hourly_rate: b.hourly_rate || 0,
      welding_types: JSON.stringify(b.welding_types || []),
      current_project_id: b.current_project_id || null, status: b.status || 'active',
      employment_start_date: b.employment_start_date || new Date().toISOString().split('T')[0],
      notes: b.notes || '',
    });
    return ok(res, enrichWorker(db, db.findOne('workers', (w) => w.id === result.lastInsertRowid)), 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleWorkerById(req: any, res: any, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const numId = parseInt(id);

  if (method === 'GET') {
    const w = db.findOne('workers', (w) => w.id === numId);
    if (!w) return err(res, 'Worker not found', 404);
    const docs = db.findAll('worker_documents', (d) => d.worker_id === numId);
    const assignments = db.findAll('project_workers', (pw) => pw.worker_id === numId).map((pw: any) => {
      const proj = db.findOne('projects', (p: any) => p.id === pw.project_id);
      return { ...pw, projectName: proj?.name };
    });
    const enriched = enrichWorker(db, w);
    return ok(res, { ...enriched, documents: docs, assignments });
  }

  if (method === 'PUT') {
    const b = req.body;
    const updates: any = {};
    if (b.first_name !== undefined) updates.first_name = b.first_name;
    if (b.last_name !== undefined) updates.last_name = b.last_name;
    if (b.nationality !== undefined) updates.nationality = b.nationality;
    if (b.phone !== undefined) updates.phone = b.phone;
    if (b.email !== undefined) updates.email = b.email;
    if (b.hourly_rate !== undefined) updates.hourly_rate = b.hourly_rate;
    if (b.welding_types !== undefined) updates.welding_types = JSON.stringify(b.welding_types);
    if (b.status !== undefined) updates.status = b.status;
    if (b.notes !== undefined) updates.notes = b.notes;
    if (b.current_project_id !== undefined) updates.current_project_id = b.current_project_id;
    db.update('workers', (w) => w.id === numId, updates);
    return ok(res, enrichWorker(db, db.findOne('workers', (w) => w.id === numId)));
  }

  if (method === 'DELETE') {
    db.update('workers', (w) => w.id === numId, { status: 'inactive' });
    return ok(res, { message: 'Worker deactivated' });
  }

  return err(res, 'Method not allowed', 405);
}

async function handleWorkerDocuments(req: any, res: any, method: string, workerId: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const wId = parseInt(workerId);

  if (method === 'GET') {
    return ok(res, db.findAll('worker_documents', (d) => d.worker_id === wId));
  }

  if (method === 'POST') {
    const b = req.body;
    const expiryDate = b.expiry_date;
    let validity_status = 'missing';
    if (expiryDate) {
      const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
      validity_status = days < 0 ? 'expired' : days <= 90 ? 'expiring_soon' : 'valid';
    }
    const result = db.insert('worker_documents', {
      worker_id: wId, doc_type: b.doc_type, trc_country: b.trc_country || null,
      trc_number: b.trc_number || null, trc_renewal_status: b.trc_renewal_status || null,
      welding_scope: b.welding_scope || null, has_tuv: b.has_tuv || 0,
      pcc_status: b.pcc_status || null, a1_country: b.a1_country || null,
      issue_date: b.issue_date || null, expiry_date: expiryDate || null,
      file_name: b.file_name || null, upload_status: 'uploaded',
      validity_status, notes: b.notes || null,
    });
    return ok(res, db.findOne('worker_documents', (d) => d.id === result.lastInsertRowid), 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleWorkerDocumentById(req: any, res: any, method: string, workerId: string, docId: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const dId = parseInt(docId);
  if (method === 'PUT') {
    const b = req.body;
    db.update('worker_documents', (d) => d.id === dId, b);
    return ok(res, db.findOne('worker_documents', (d) => d.id === dId));
  }
  if (method === 'DELETE') {
    db.remove('worker_documents', (d) => d.id === dId);
    return ok(res, { message: 'Document removed' });
  }
  return err(res, 'Method not allowed', 405);
}

// ──────────── PROJECTS ────────────

async function handleProjects(req: any, res: any, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();

  if (method === 'GET') {
    const { phase } = req.query as any;
    let projects = db.findAll('projects');
    if (phase && phase !== 'all') projects = projects.filter((p) => p.phase === phase);
    projects.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
    return ok(res, projects.map((p) => ({
      ...p, workerCount: db.count('project_workers', (pw) => pw.project_id === p.id && !pw.removed_date),
    })));
  }

  if (method === 'POST') {
    const b = req.body;
    const result = db.insert('projects', {
      name: b.name, client: b.client || '', location: b.location || '', country: b.country || '',
      phase: b.phase || 'mobilization', start_date: b.start_date || null, expected_end_date: b.expected_end_date || null,
      progress: b.progress || 0,
      budget_labor: b.budget_labor || 0, budget_transport: b.budget_transport || 0,
      budget_accommodation: b.budget_accommodation || 0, budget_tools: b.budget_tools || 0,
      budget_per_diem: b.budget_per_diem || 0, budget_other: b.budget_other || 0,
      actual_labor: 0, actual_transport: 0, actual_accommodation: 0, actual_tools: 0, actual_per_diem: 0, actual_other: 0,
      notes: b.notes || '',
    });
    return ok(res, db.findOne('projects', (p) => p.id === result.lastInsertRowid), 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleProjectById(req: any, res: any, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const numId = parseInt(id);

  if (method === 'GET') {
    const project = db.findOne('projects', (p) => p.id === numId);
    if (!project) return err(res, 'Project not found', 404);
    const workers = db.findAll('project_workers', (pw) => pw.project_id === numId && !pw.removed_date).map((pw: any) => {
      const w = db.findOne('workers', (wr: any) => wr.id === pw.worker_id);
      return { ...pw, first_name: w?.first_name, last_name: w?.last_name, status: w?.status };
    });
    const expenses = db.findAll('expenses', (e) => e.project_id === numId).map((e: any) => {
      const cat = db.findOne('expense_categories', (c: any) => c.id === e.category_id);
      return { ...e, categoryName: cat?.name };
    });
    return ok(res, { ...project, workers, expenses, workerCount: workers.length });
  }

  if (method === 'PUT') {
    const b = req.body;
    const updates: any = {};
    const fields = ['name', 'client', 'location', 'country', 'phase', 'start_date', 'expected_end_date', 'progress', 'budget_labor', 'budget_transport', 'budget_accommodation', 'budget_tools', 'budget_per_diem', 'budget_other', 'notes'];
    fields.forEach((f) => { if (b[f] !== undefined) updates[f] = b[f]; });
    db.update('projects', (p) => p.id === numId, updates);
    return ok(res, db.findOne('projects', (p) => p.id === numId));
  }

  if (method === 'DELETE') {
    db.remove('projects', (p) => p.id === numId);
    return ok(res, { message: 'Project deleted' });
  }

  return err(res, 'Method not allowed', 405);
}

async function handleProjectWorkers(req: any, res: any, method: string, projectId: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const pId = parseInt(projectId);

  if (method === 'POST') {
    const { workerId } = req.body;
    db.insert('project_workers', { project_id: pId, worker_id: workerId, assigned_date: new Date().toISOString().split('T')[0] });
    db.update('workers', (w) => w.id === workerId, { current_project_id: pId });
    return ok(res, { message: 'Worker assigned' }, 201);
  }

  if (method === 'DELETE') {
    const { workerId } = req.body;
    db.update('project_workers', (pw) => pw.project_id === pId && pw.worker_id === workerId && !pw.removed_date, { removed_date: new Date().toISOString().split('T')[0] });
    db.update('workers', (w) => w.id === workerId && w.current_project_id === pId, { current_project_id: null });
    return ok(res, { message: 'Worker unassigned' });
  }

  return err(res, 'Method not allowed', 405);
}

// ──────────── EXPENSES ────────────

async function handleExpenses(req: any, res: any, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();

  if (method === 'GET') {
    const { projectId, workerId, categoryId } = req.query as any;
    let expenses = db.findAll('expenses');
    if (projectId && projectId !== 'all') expenses = expenses.filter((e) => e.project_id === parseInt(projectId));
    if (workerId) expenses = expenses.filter((e) => e.worker_id === parseInt(workerId));
    if (categoryId) expenses = expenses.filter((e) => e.category_id === parseInt(categoryId));
    expenses.sort((a: any, b: any) => (b.expense_date || b.created_at || '').localeCompare(a.expense_date || a.created_at || ''));
    return ok(res, expenses.map((e) => {
      const cat = db.findOne('expense_categories', (c) => c.id === e.category_id);
      const proj = e.project_id ? db.findOne('projects', (p) => p.id === e.project_id) : null;
      const worker = e.worker_id ? db.findOne('workers', (w) => w.id === e.worker_id) : null;
      return { ...e, categoryName: cat?.name, projectName: proj?.name, workerName: worker ? `${worker.first_name} ${worker.last_name}` : null };
    }));
  }

  if (method === 'POST') {
    const b = req.body;
    const result = db.insert('expenses', {
      project_id: b.projectId || null, worker_id: b.workerId || null,
      category_id: b.categoryId || 7, amount: b.amount || 0,
      description: b.description || '', expense_date: b.expenseDate || new Date().toISOString().split('T')[0],
      is_recurring: b.isRecurring ? 1 : 0, recurrence_interval: b.recurrenceInterval || null,
      notes: b.notes || '',
    });
    return ok(res, { id: result.lastInsertRowid }, 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handleExpenseById(req: any, res: any, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const numId = parseInt(id);

  if (method === 'GET') {
    const e = db.findOne('expenses', (e) => e.id === numId);
    if (!e) return err(res, 'Expense not found', 404);
    const cat = db.findOne('expense_categories', (c) => c.id === e.category_id);
    const proj = e.project_id ? db.findOne('projects', (p) => p.id === e.project_id) : null;
    const worker = e.worker_id ? db.findOne('workers', (w) => w.id === e.worker_id) : null;
    return ok(res, { ...e, categoryName: cat?.name, projectName: proj?.name, workerName: worker ? `${worker.first_name} ${worker.last_name}` : null });
  }

  if (method === 'PUT') {
    db.update('expenses', (e) => e.id === numId, req.body);
    return ok(res, db.findOne('expenses', (e) => e.id === numId));
  }

  if (method === 'DELETE') {
    db.remove('expenses', (e) => e.id === numId);
    return ok(res, { message: 'Expense deleted' });
  }

  return err(res, 'Method not allowed', 405);
}

async function handleExpenseSummary(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const expenses = db.findAll('expenses');
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const cats = db.findAll('expense_categories');
  const byCategory = cats.map((c) => {
    const amount = expenses.filter((e) => e.category_id === c.id).reduce((s, e) => s + (e.amount || 0), 0);
    return { category: c.name, amount, color: c.color };
  }).filter((c) => c.amount > 0);
  const projects = db.findAll('projects');
  const byProject = projects.map((p) => {
    const amount = expenses.filter((e) => e.project_id === p.id).reduce((s, e) => s + (e.amount || 0), 0);
    return { project: p.name, amount };
  }).filter((p) => p.amount > 0);
  return ok(res, { total, byCategory, byProject });
}

// ──────────── PIPELINE ────────────

async function handlePipeline(req: any, res: any, method: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();

  if (method === 'GET') {
    const { stage } = req.query as any;
    let candidates = db.findAll('pipeline_candidates');
    if (stage && stage !== 'all') candidates = candidates.filter((c) => c.stage === stage);
    return ok(res, candidates.map((c) => {
      const docs = db.findAll('pipeline_documents', (d) => d.candidate_id === c.id);
      return { ...c, docsReceived: docs.filter((d) => d.is_received).length, docsTotal: 7 };
    }));
  }

  if (method === 'POST') {
    const b = req.body;
    const result = db.insert('pipeline_candidates', {
      first_name: b.firstName, last_name: b.lastName, nationality: b.nationality || '',
      phone: b.phone || '', email: b.email || '', stage: 'interested',
      expected_arrival_date: b.expectedArrivalDate || null, notes: b.notes || '',
    });
    return ok(res, db.findOne('pipeline_candidates', (c) => c.id === result.lastInsertRowid), 201);
  }

  return err(res, 'Method not allowed', 405);
}

async function handlePipelineById(req: any, res: any, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const numId = parseInt(id);

  if (method === 'GET') {
    const c = db.findOne('pipeline_candidates', (c) => c.id === numId);
    if (!c) return err(res, 'Candidate not found', 404);
    const documents = db.findAll('pipeline_documents', (d) => d.candidate_id === numId);
    return ok(res, { ...c, documents, docsReceived: documents.filter((d) => d.is_received).length, docsTotal: 7 });
  }

  if (method === 'PUT') {
    const b = req.body;
    const updates: any = {};
    if (b.stage !== undefined) updates.stage = b.stage;
    if (b.first_name !== undefined) updates.first_name = b.first_name;
    if (b.last_name !== undefined) updates.last_name = b.last_name;
    if (b.notes !== undefined) updates.notes = b.notes;
    db.update('pipeline_candidates', (c) => c.id === numId, updates);
    return ok(res, db.findOne('pipeline_candidates', (c) => c.id === numId));
  }

  if (method === 'DELETE') {
    db.remove('pipeline_documents', (d) => d.candidate_id === numId);
    db.remove('pipeline_candidates', (c) => c.id === numId);
    return ok(res, { message: 'Candidate removed' });
  }

  return err(res, 'Method not allowed', 405);
}

async function handlePipelineDocToggle(req: any, res: any, candidateId: string, docType: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const cId = parseInt(candidateId);
  const existing = db.findOne('pipeline_documents', (d) => d.candidate_id === cId && d.doc_type === docType);
  if (existing) {
    const newVal = existing.is_received ? 0 : 1;
    db.update('pipeline_documents', (d) => d.id === existing.id, { is_received: newVal, received_date: newVal ? new Date().toISOString().split('T')[0] : null });
  } else {
    db.insert('pipeline_documents', { candidate_id: cId, doc_type: docType, is_received: 1, received_date: new Date().toISOString().split('T')[0], notes: null });
  }
  return ok(res, { message: 'Document toggled' });
}

// ──────────── DASHBOARD / ALERTS ────────────

async function handleDashboardSummary(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();

  const workers = db.findAll('workers');
  const activeWorkers = workers.filter((w) => w.status === 'active').length;
  const activeProjects = db.count('projects', (p) => p.phase === 'active' || p.phase === 'mobilization');
  const totalExpenses = db.sum('expenses', 'amount');
  const pipelineCandidates = db.count('pipeline_candidates');

  // Count TRC expiring (within 90 days)
  let trcExpiring = 0;
  workers.forEach((w) => {
    const trc = db.findOne('worker_documents', (d) => d.worker_id === w.id && d.doc_type === 'trc');
    if (trc?.expiry_date) {
      const days = Math.ceil((new Date(trc.expiry_date).getTime() - Date.now()) / 86400000);
      if (days >= 0 && days <= 90) trcExpiring++;
    }
  });

  return ok(res, { activeWorkers, totalWorkers: workers.length, activeProjects, totalExpenses, pipelineCandidates, trcExpiring, budgetWarnings: 0 });
}

async function handleAlerts(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const alerts: any[] = [];

  // TRC alerts
  db.findAll('workers').forEach((w) => {
    const trc = db.findOne('worker_documents', (d) => d.worker_id === w.id && d.doc_type === 'trc');
    if (trc?.expiry_date) {
      const days = Math.ceil((new Date(trc.expiry_date).getTime() - Date.now()) / 86400000);
      if (days < 0) {
        alerts.push({ type: 'trc_expired', severity: 'critical', title: `TRC Expired: ${w.first_name} ${w.last_name}`, message: `TRC expired ${Math.abs(days)} days ago`, workerId: w.id });
      } else if (days <= 30) {
        alerts.push({ type: 'trc_expiring', severity: 'critical', title: `TRC Expiring: ${w.first_name} ${w.last_name}`, message: `TRC expires in ${days} days`, workerId: w.id });
      } else if (days <= 90) {
        alerts.push({ type: 'trc_expiring', severity: 'warning', title: `TRC Expiring Soon: ${w.first_name} ${w.last_name}`, message: `TRC expires in ${days} days`, workerId: w.id });
      }
    }
    // Welding cert alerts
    const certs = db.findAll('worker_documents', (d) => d.worker_id === w.id && d.doc_type === 'welding_cert');
    certs.forEach((cert) => {
      if (cert.expiry_date) {
        const days = Math.ceil((new Date(cert.expiry_date).getTime() - Date.now()) / 86400000);
        if (days < 0) {
          alerts.push({ type: 'cert_expired', severity: 'warning', title: `Cert Expired: ${w.first_name} ${w.last_name}`, message: `Welding certificate expired ${Math.abs(days)} days ago`, workerId: w.id });
        } else if (days <= 60) {
          alerts.push({ type: 'cert_expiring', severity: 'warning', title: `Cert Expiring: ${w.first_name} ${w.last_name}`, message: `Welding certificate expires in ${days} days`, workerId: w.id });
        }
      }
    });
  });

  // Budget alerts
  db.findAll('projects', (p) => p.phase === 'active' || p.phase === 'mobilization').forEach((p) => {
    const budget = (p.budget_labor || 0) + (p.budget_transport || 0) + (p.budget_accommodation || 0) + (p.budget_tools || 0) + (p.budget_per_diem || 0) + (p.budget_other || 0);
    const actual = (p.actual_labor || 0) + (p.actual_transport || 0) + (p.actual_accommodation || 0) + (p.actual_tools || 0) + (p.actual_per_diem || 0) + (p.actual_other || 0);
    if (budget > 0) {
      const ratio = actual / budget;
      if (ratio > 0.9) {
        alerts.push({ type: 'budget_overrun', severity: 'critical', title: `Budget Alert: ${p.name}`, message: `${Math.round(ratio * 100)}% of budget used`, projectId: p.id });
      } else if (ratio > 0.7) {
        alerts.push({ type: 'budget_warning', severity: 'warning', title: `Budget Warning: ${p.name}`, message: `${Math.round(ratio * 100)}% of budget used`, projectId: p.id });
      }
    }
  });

  // Sort: critical first
  alerts.sort((a, b) => (a.severity === 'critical' ? 0 : 1) - (b.severity === 'critical' ? 0 : 1));
  return ok(res, alerts);
}

// ──────────── NOTIFICATIONS ────────────

async function handleNotifications(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  return ok(res, getDb().findAll('notifications', (n) => n.user_id === auth.userId).sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 50));
}

async function handleUnreadCount(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  return ok(res, { count: getDb().count('notifications', (n) => n.user_id === auth.userId && !n.is_read) });
}

async function handleReadAll(req: any, res: any) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  getDb().update('notifications', (n) => n.user_id === auth.userId, { is_read: 1 });
  return ok(res, { message: 'All marked as read' });
}

async function handleNotificationById(req: any, res: any, method: string, id: string) {
  const auth = getUserFromRequest(req);
  if (!auth) return err(res, 'Not authenticated', 401);
  const db = getDb();
  const numId = parseInt(id);
  if (method === 'PUT') { db.update('notifications', (n) => n.id === numId && n.user_id === auth.userId, { is_read: 1 }); return ok(res, { message: 'Marked as read' }); }
  if (method === 'DELETE') { db.remove('notifications', (n) => n.id === numId && n.user_id === auth.userId); return ok(res, { message: 'Notification deleted' }); }
  return err(res, 'Method not allowed', 405);
}
