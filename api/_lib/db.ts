/**
 * Pure in-memory database for Vercel serverless.
 * No external dependencies. Ephemeral per cold start.
 * LinkedWeld Pro — Welding Subcontractor Management
 */

interface Table {
  rows: any[];
  autoId: number;
}

interface Store {
  [tableName: string]: Table;
}

let store: Store | null = null;

function now(): string {
  return new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
}

/* Pre-computed bcrypt hash for password "demo123" */
const DEMO_HASH = '$2a$10$Eto1/Pr2qxDYDEhUcFIhfudPXWhGu39t/9rPuG/KDariPOpy8qfqy';

/* ── Helper: push row with auto-id ── */
function push(t: Table, row: any) {
  t.rows.push({ id: t.autoId++, ...row, created_at: now(), updated_at: now() });
}
function pushDoc(t: Table, row: any) {
  t.rows.push({ id: t.autoId++, ...row, upload_status: 'uploaded', created_at: now() });
}

function initStore(): Store {
  const s: Store = {
    users: { rows: [], autoId: 1 },
    refresh_tokens: { rows: [], autoId: 1 },
    workers: { rows: [], autoId: 1 },
    worker_documents: { rows: [], autoId: 1 },
    projects: { rows: [], autoId: 1 },
    project_workers: { rows: [], autoId: 1 },
    expense_categories: { rows: [], autoId: 1 },
    expenses: { rows: [], autoId: 1 },
    pipeline_candidates: { rows: [], autoId: 1 },
    pipeline_documents: { rows: [], autoId: 1 },
    notifications: { rows: [], autoId: 1 },
  };

  // ═══════════════════ USERS ═══════════════════
  push(s.users, {
    email: 'jambrovic.nino@gmail.com', password_hash: DEMO_HASH,
    first_name: 'Nino', last_name: 'Jambrovic', role: 'director',
    phone: '+386 41 123 456', company_name: 'Jambrovic Welding d.o.o.',
    is_active: 1, is_verified: 1, verification_code: null, verification_expires_at: null,
  });
  push(s.users, {
    email: 'secretary@linkedweld.pro', password_hash: DEMO_HASH,
    first_name: 'Ana', last_name: 'Kovač', role: 'secretary',
    phone: '+386 41 987 654', company_name: 'Jambrovic Welding d.o.o.',
    is_active: 1, is_verified: 1, verification_code: null, verification_expires_at: null,
  });

  // ═══════════════════ EXPENSE CATEGORIES ═══════════════════
  const cats = [
    { name: 'Transport', icon: 'Car', color: '#3b82f6' },
    { name: 'Fuel', icon: 'Fuel', color: '#8b5cf6' },
    { name: 'Accommodation', icon: 'Home', color: '#10b981' },
    { name: 'Per Diem', icon: 'Wallet', color: '#f59e0b' },
    { name: 'Tools/Equipment', icon: 'Wrench', color: '#ef4444' },
    { name: 'Permits/Fees', icon: 'FileText', color: '#6366f1' },
    { name: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
  ];
  cats.forEach((c) => push(s.expense_categories, c));

  // ═══════════════════ WORKERS (35) ═══════════════════
  // Helper to stringify welding types
  const W = (types: string[]) => JSON.stringify(types);

  const workers: any[] = [
    // ── Indian workers (20) ──
    { first_name: 'Rajesh', last_name: 'Sharma', nationality: 'Indian', phone: '+91 98765 43210', email: 'rajesh.sharma@example.com', hourly_rate: 18, welding_types: W(['TIG', 'MIG']), current_project_id: 1, status: 'active', employment_start_date: '2024-06-15', notes: 'Team lead Koper project. 8 years TIG experience.' },
    { first_name: 'Arjun', last_name: 'Patel', nationality: 'Indian', phone: '+91 91234 56789', email: 'arjun.patel@example.com', hourly_rate: 16, welding_types: W(['Stick', 'Flux-Cored']), current_project_id: 1, status: 'active', employment_start_date: '2024-09-01', notes: 'Stick welding specialist. Very reliable.' },
    { first_name: 'Vikram', last_name: 'Kumar', nationality: 'Indian', phone: '+91 98111 22233', email: 'vikram.kumar@example.com', hourly_rate: 19, welding_types: W(['TIG', 'SAW']), current_project_id: 2, status: 'active', employment_start_date: '2024-01-10', notes: 'SAW specialist. Pipeline experience Austria.' },
    { first_name: 'Suresh', last_name: 'Reddy', nationality: 'Indian', phone: '+91 99887 11223', email: 'suresh.reddy@example.com', hourly_rate: 17, welding_types: W(['TIG', 'MIG']), current_project_id: 1, status: 'active', employment_start_date: '2024-11-01', notes: 'TIG welder, stainless steel piping.' },
    { first_name: 'Pradeep', last_name: 'Yadav', nationality: 'Indian', phone: '+91 97654 33210', email: 'pradeep.yadav@example.com', hourly_rate: 15, welding_types: W(['MIG']), current_project_id: 4, status: 'active', employment_start_date: '2025-02-01', notes: 'MIG welder, structural steel.' },
    { first_name: 'Amit', last_name: 'Singh', nationality: 'Indian', phone: '+91 98765 99988', email: 'amit.singh@example.com', hourly_rate: 20, welding_types: W(['TIG', 'MIG', 'Stick']), current_project_id: 1, status: 'active', employment_start_date: '2023-09-15', notes: 'Multi-process. Foreman material.' },
    { first_name: 'Sanjay', last_name: 'Gupta', nationality: 'Indian', phone: '+91 96543 21098', email: 'sanjay.gupta@example.com', hourly_rate: 16, welding_types: W(['TIG']), current_project_id: 4, status: 'active', employment_start_date: '2025-01-15', notes: 'TIG specialist. Bridge work.' },
    { first_name: 'Rakesh', last_name: 'Thakur', nationality: 'Indian', phone: '+91 98111 55566', email: 'rakesh.thakur@example.com', hourly_rate: 17, welding_types: W(['MIG', 'Flux-Cored']), current_project_id: 6, status: 'active', employment_start_date: '2024-04-20', notes: 'Flux-cored specialist. Power plant experience.' },
    { first_name: 'Mahesh', last_name: 'Nair', nationality: 'Indian', phone: '+91 97777 88899', email: 'mahesh.nair@example.com', hourly_rate: 18, welding_types: W(['TIG', 'MIG']), current_project_id: 6, status: 'active', employment_start_date: '2024-05-10', notes: 'Pipe welder. Nuclear grade quality.' },
    { first_name: 'Dinesh', last_name: 'Verma', nationality: 'Indian', phone: '+91 91111 22244', email: 'dinesh.verma@example.com', hourly_rate: 15, welding_types: W(['Stick']), current_project_id: 4, status: 'active', employment_start_date: '2025-03-01', notes: 'Stick welder. Structural work.' },
    { first_name: 'Ravi', last_name: 'Tiwari', nationality: 'Indian', phone: '+91 98888 77766', email: 'ravi.tiwari@example.com', hourly_rate: 16, welding_types: W(['TIG']), current_project_id: 1, status: 'active', employment_start_date: '2024-08-15', notes: 'TIG welder. Clean welds.' },
    { first_name: 'Anil', last_name: 'Chauhan', nationality: 'Indian', phone: '+91 99999 11122', email: 'anil.chauhan@example.com', hourly_rate: 14, welding_types: W(['MIG']), current_project_id: null, status: 'on_leave', employment_start_date: '2025-01-20', notes: 'On leave — medical. Returns March.' },
    { first_name: 'Ganesh', last_name: 'Joshi', nationality: 'Indian', phone: '+91 92222 33344', email: 'ganesh.joshi@example.com', hourly_rate: 17, welding_types: W(['TIG', 'MIG']), current_project_id: 2, status: 'active', employment_start_date: '2024-07-01', notes: 'Pipeline welder. Good with carbon steel.' },
    { first_name: 'Suman', last_name: 'Rai', nationality: 'Indian', phone: '+91 93333 44455', email: 'suman.rai@example.com', hourly_rate: 15, welding_types: W(['Stick', 'MIG']), current_project_id: null, status: 'inactive', employment_start_date: '2024-03-01', notes: 'Contract ended. Good worker, may rehire.' },
    { first_name: 'Kishore', last_name: 'Pillai', nationality: 'Indian', phone: '+91 94444 55566', email: 'kishore.pillai@example.com', hourly_rate: 18, welding_types: W(['TIG', 'SAW']), current_project_id: 6, status: 'active', employment_start_date: '2024-06-01', notes: 'SAW qualified. Power plant piping.' },
    { first_name: 'Deepak', last_name: 'Mishra', nationality: 'Indian', phone: '+91 95555 66677', email: 'deepak.mishra@example.com', hourly_rate: 16, welding_types: W(['MIG', 'Stick']), current_project_id: 4, status: 'active', employment_start_date: '2025-01-10', notes: 'Structural welder. Bridge project.' },
    { first_name: 'Manish', last_name: 'Pandey', nationality: 'Indian', phone: '+91 96666 77788', email: 'manish.pandey@example.com', hourly_rate: 19, welding_types: W(['TIG']), current_project_id: 5, status: 'active', employment_start_date: '2024-10-01', notes: 'TIG specialist. Port crane work Italy.' },
    { first_name: 'Nitin', last_name: 'Bhat', nationality: 'Indian', phone: '+91 97777 88800', email: 'nitin.bhat@example.com', hourly_rate: 15, welding_types: W(['MIG']), current_project_id: null, status: 'inactive', employment_start_date: '2024-01-15', notes: 'Returned to India. Visa expired.' },
    { first_name: 'Ashok', last_name: 'Menon', nationality: 'Indian', phone: '+91 98888 99911', email: 'ashok.menon@example.com', hourly_rate: 17, welding_types: W(['TIG', 'MIG']), current_project_id: 1, status: 'active', employment_start_date: '2024-12-01', notes: 'New arrival. Refinery piping work.' },
    { first_name: 'Ramesh', last_name: 'Iyer', nationality: 'Indian', phone: '+91 91234 00011', email: 'ramesh.iyer@example.com', hourly_rate: 22, welding_types: W(['TIG', 'MIG', 'SAW']), current_project_id: 2, status: 'active', employment_start_date: '2023-05-01', notes: 'Senior welder. 12 years experience. Quality inspector.' },
    // ── Filipino workers (8) ──
    { first_name: 'Mark', last_name: 'Santos', nationality: 'Filipino', phone: '+63 912 345 6789', email: 'mark.santos@example.com', hourly_rate: 17, welding_types: W(['TIG', 'MIG', 'Stick']), current_project_id: 2, status: 'active', employment_start_date: '2024-03-20', notes: 'Multi-process. Very reliable.' },
    { first_name: 'Jose', last_name: 'Reyes', nationality: 'Filipino', phone: '+63 917 654 3210', email: 'jose.reyes@example.com', hourly_rate: 19, welding_types: W(['TIG', 'SAW']), current_project_id: 2, status: 'active', employment_start_date: '2023-11-05', notes: 'SAW specialist. Pipeline experience.' },
    { first_name: 'Carlo', last_name: 'Garcia', nationality: 'Filipino', phone: '+63 918 111 2233', email: 'carlo.garcia@example.com', hourly_rate: 16, welding_types: W(['MIG', 'Stick']), current_project_id: 4, status: 'active', employment_start_date: '2024-08-15', notes: 'Structural welder.' },
    { first_name: 'Miguel', last_name: 'Ramos', nationality: 'Filipino', phone: '+63 919 222 3344', email: 'miguel.ramos@example.com', hourly_rate: 17, welding_types: W(['TIG']), current_project_id: 5, status: 'active', employment_start_date: '2024-09-01', notes: 'TIG specialist. Port crane work.' },
    { first_name: 'Paolo', last_name: 'Cruz', nationality: 'Filipino', phone: '+63 920 333 4455', email: 'paolo.cruz@example.com', hourly_rate: 15, welding_types: W(['MIG']), current_project_id: 6, status: 'active', employment_start_date: '2024-07-20', notes: 'MIG welder. Power plant.' },
    { first_name: 'Antonio', last_name: 'Bautista', nationality: 'Filipino', phone: '+63 921 444 5566', email: 'antonio.bautista@example.com', hourly_rate: 18, welding_types: W(['TIG', 'MIG']), current_project_id: 1, status: 'active', employment_start_date: '2024-05-10', notes: 'Pipe welder. Refinery specialist.' },
    { first_name: 'Rafael', last_name: 'Aquino', nationality: 'Filipino', phone: '+63 922 555 6677', email: 'rafael.aquino@example.com', hourly_rate: 16, welding_types: W(['Stick', 'Flux-Cored']), current_project_id: null, status: 'on_leave', employment_start_date: '2024-11-01', notes: 'On leave — TRC renewal in progress.' },
    { first_name: 'Luis', last_name: 'Dela Cruz', nationality: 'Filipino', phone: '+63 923 666 7788', email: 'luis.delacruz@example.com', hourly_rate: 14, welding_types: W(['MIG']), current_project_id: null, status: 'inactive', employment_start_date: '2024-02-01', notes: 'Contract finished. Returned to Philippines.' },
    // ── Nepalese workers (4) ──
    { first_name: 'Suman', last_name: 'Thapa', nationality: 'Nepalese', phone: '+977 984 1234567', email: 'suman.thapa@example.com', hourly_rate: 15, welding_types: W(['MIG']), current_project_id: null, status: 'on_leave', employment_start_date: '2025-01-10', notes: 'On leave — visa renewal.' },
    { first_name: 'Bikram', last_name: 'Gurung', nationality: 'Nepalese', phone: '+977 985 2345678', email: 'bikram.gurung@example.com', hourly_rate: 16, welding_types: W(['TIG', 'MIG']), current_project_id: 4, status: 'active', employment_start_date: '2024-10-15', notes: 'Bridge welding. Good quality.' },
    { first_name: 'Prakash', last_name: 'Tamang', nationality: 'Nepalese', phone: '+977 986 3456789', email: 'prakash.tamang@example.com', hourly_rate: 15, welding_types: W(['Stick']), current_project_id: 1, status: 'active', employment_start_date: '2024-12-01', notes: 'Stick welder. Refinery support.' },
    { first_name: 'Dipak', last_name: 'Maharjan', nationality: 'Nepalese', phone: '+977 987 4567890', email: 'dipak.maharjan@example.com', hourly_rate: 14, welding_types: W(['MIG']), current_project_id: null, status: 'inactive', employment_start_date: '2024-06-01', notes: 'Returned to Nepal. May come back next season.' },
    // ── Sri Lankan workers (2) ──
    { first_name: 'Chaminda', last_name: 'Silva', nationality: 'Sri Lankan', phone: '+94 77 1234567', email: 'chaminda.silva@example.com', hourly_rate: 16, welding_types: W(['TIG', 'MIG']), current_project_id: 6, status: 'active', employment_start_date: '2024-08-01', notes: 'Pipe welder. Nuclear plant experience.' },
    { first_name: 'Nuwan', last_name: 'Perera', nationality: 'Sri Lankan', phone: '+94 77 2345678', email: 'nuwan.perera@example.com', hourly_rate: 15, welding_types: W(['MIG', 'Stick']), current_project_id: 4, status: 'active', employment_start_date: '2024-09-15', notes: 'Structural welder.' },
    // ── Bosnian worker (1) ──
    { first_name: 'Emir', last_name: 'Hodžić', nationality: 'Bosnian', phone: '+387 61 234 567', email: 'emir.hodzic@example.com', hourly_rate: 21, welding_types: W(['TIG', 'MIG', 'SAW']), current_project_id: 2, status: 'active', employment_start_date: '2023-03-01', notes: 'Senior welder. EU citizen — no TRC needed. Site supervisor.' },
  ];
  workers.forEach((w) => push(s.workers, w));

  // ═══════════════════ PROJECTS (8) ═══════════════════
  const projects: any[] = [
    { name: 'Koper Refinery Maintenance', client: 'Petrol d.d.', location: 'Koper', country: 'Slovenia', phase: 'active', start_date: '2025-10-01', expected_end_date: '2026-06-30', progress: 65, budget_labor: 85000, budget_transport: 12000, budget_accommodation: 22000, budget_tools: 8000, budget_per_diem: 15000, budget_other: 6000, actual_labor: 58000, actual_transport: 8500, actual_accommodation: 16000, actual_tools: 5200, actual_per_diem: 10500, actual_other: 3800, notes: 'Annual maintenance shutdown. TIG and MIG welding on stainless steel piping. 10 welders assigned.' },
    { name: 'Graz Pipeline Extension', client: 'OMV AG', location: 'Graz', country: 'Austria', phase: 'mobilization', start_date: '2026-02-15', expected_end_date: '2026-09-30', progress: 10, budget_labor: 120000, budget_transport: 18000, budget_accommodation: 30000, budget_tools: 12000, budget_per_diem: 20000, budget_other: 8000, actual_labor: 4000, actual_transport: 3200, actual_accommodation: 2500, actual_tools: 1800, actual_per_diem: 0, actual_other: 800, notes: 'New gas pipeline section. SAW and TIG welding. A1 forms needed for Austria. 6 welders planned.' },
    { name: 'Ljubljana Storage Tanks', client: 'Nafta Lendava', location: 'Ljubljana', country: 'Slovenia', phase: 'completed', start_date: '2025-04-01', expected_end_date: '2025-12-15', progress: 100, budget_labor: 55000, budget_transport: 7000, budget_accommodation: 14000, budget_tools: 4500, budget_per_diem: 8000, budget_other: 3500, actual_labor: 52000, actual_transport: 6800, actual_accommodation: 13200, actual_tools: 4100, actual_per_diem: 7600, actual_other: 2900, notes: 'Completed on time. All welds passed NDT inspection. Client very satisfied.' },
    { name: 'Maribor Steel Bridge Repair', client: 'SŽ d.o.o.', location: 'Maribor', country: 'Slovenia', phase: 'active', start_date: '2025-12-01', expected_end_date: '2026-05-15', progress: 40, budget_labor: 70000, budget_transport: 9000, budget_accommodation: 16000, budget_tools: 6000, budget_per_diem: 11000, budget_other: 5000, actual_labor: 28000, actual_transport: 4200, actual_accommodation: 7500, actual_tools: 3100, actual_per_diem: 4800, actual_other: 2200, notes: 'Railway bridge reinforcement. Structural MIG and Stick welding. 7 welders on site.' },
    { name: 'Trieste Port Cranes', client: 'Fincantieri S.p.A.', location: 'Trieste', country: 'Italy', phase: 'mobilization', start_date: '2026-03-01', expected_end_date: '2026-08-30', progress: 5, budget_labor: 95000, budget_transport: 15000, budget_accommodation: 25000, budget_tools: 10000, budget_per_diem: 16000, budget_other: 7000, actual_labor: 0, actual_transport: 1500, actual_accommodation: 0, actual_tools: 800, actual_per_diem: 0, actual_other: 500, notes: 'Port crane maintenance and repair. TIG specialist needed. A1 forms for Italy.' },
    { name: 'Krško Nuclear Plant Shutdown', client: 'NEK d.o.o.', location: 'Krško', country: 'Slovenia', phase: 'finishing', start_date: '2025-06-01', expected_end_date: '2026-03-15', progress: 90, budget_labor: 110000, budget_transport: 10000, budget_accommodation: 20000, budget_tools: 9000, budget_per_diem: 14000, budget_other: 7000, actual_labor: 102000, actual_transport: 9800, actual_accommodation: 19500, actual_tools: 8700, actual_per_diem: 13200, actual_other: 6500, notes: 'Annual reactor shutdown maintenance. Nuclear-grade welding. Strict quality requirements. 6 welders.' },
    { name: 'Munich Petrochemical Plant', client: 'BASF SE', location: 'Munich', country: 'Germany', phase: 'mobilization', start_date: '2026-04-01', expected_end_date: '2026-11-30', progress: 0, budget_labor: 150000, budget_transport: 20000, budget_accommodation: 35000, budget_tools: 14000, budget_per_diem: 22000, budget_other: 10000, actual_labor: 0, actual_transport: 0, actual_accommodation: 0, actual_tools: 0, actual_per_diem: 0, actual_other: 0, notes: 'Large petrochemical project. 10+ welders needed. A1 forms for Germany. Planning phase.' },
    { name: 'Celje Industrial Park', client: 'Cinkarna d.d.', location: 'Celje', country: 'Slovenia', phase: 'completed', start_date: '2025-02-01', expected_end_date: '2025-09-30', progress: 100, budget_labor: 42000, budget_transport: 5500, budget_accommodation: 10000, budget_tools: 3500, budget_per_diem: 6000, budget_other: 2500, actual_labor: 40500, actual_transport: 5200, actual_accommodation: 9800, actual_tools: 3300, actual_per_diem: 5800, actual_other: 2100, notes: 'Chemical plant maintenance completed. All inspections passed.' },
  ];
  projects.forEach((p) => push(s.projects, p));

  // ═══════════════════ PROJECT_WORKERS ═══════════════════
  // Project 1 (Koper) — workers: 1,2,4,6,11,19,20,26,31
  const pw: any[] = [
    { project_id: 1, worker_id: 1, assigned_date: '2025-10-01' },
    { project_id: 1, worker_id: 2, assigned_date: '2025-10-01' },
    { project_id: 1, worker_id: 4, assigned_date: '2025-11-01' },
    { project_id: 1, worker_id: 6, assigned_date: '2025-10-01' },
    { project_id: 1, worker_id: 11, assigned_date: '2025-10-15' },
    { project_id: 1, worker_id: 19, assigned_date: '2024-12-01' },
    { project_id: 1, worker_id: 20, assigned_date: '2025-10-01' },
    { project_id: 1, worker_id: 26, assigned_date: '2025-05-10' },
    { project_id: 1, worker_id: 31, assigned_date: '2025-12-01' },
    // Project 2 (Graz) — workers: 3,13,21,22,35
    { project_id: 2, worker_id: 3, assigned_date: '2026-02-15' },
    { project_id: 2, worker_id: 13, assigned_date: '2026-02-15' },
    { project_id: 2, worker_id: 21, assigned_date: '2024-03-20' },
    { project_id: 2, worker_id: 22, assigned_date: '2024-11-05' },
    { project_id: 2, worker_id: 35, assigned_date: '2026-02-15' },
    // Project 4 (Maribor) — workers: 5,7,10,16,23,30,34
    { project_id: 4, worker_id: 5, assigned_date: '2025-12-01' },
    { project_id: 4, worker_id: 7, assigned_date: '2025-12-01' },
    { project_id: 4, worker_id: 10, assigned_date: '2025-12-01' },
    { project_id: 4, worker_id: 16, assigned_date: '2025-12-15' },
    { project_id: 4, worker_id: 23, assigned_date: '2025-12-01' },
    { project_id: 4, worker_id: 30, assigned_date: '2025-12-01' },
    { project_id: 4, worker_id: 34, assigned_date: '2025-12-01' },
    // Project 5 (Trieste) — workers: 17,24
    { project_id: 5, worker_id: 17, assigned_date: '2026-02-01' },
    { project_id: 5, worker_id: 24, assigned_date: '2026-02-01' },
    // Project 6 (Krško) — workers: 8,9,15,25,33
    { project_id: 6, worker_id: 8, assigned_date: '2025-06-01' },
    { project_id: 6, worker_id: 9, assigned_date: '2025-06-01' },
    { project_id: 6, worker_id: 15, assigned_date: '2025-06-01' },
    { project_id: 6, worker_id: 25, assigned_date: '2025-07-20' },
    { project_id: 6, worker_id: 33, assigned_date: '2025-08-01' },
  ];
  pw.forEach((r) => { s.project_workers.rows.push({ id: s.project_workers.autoId++, ...r, removed_date: null, created_at: now() }); });

  // ═══════════════════ WORKER DOCUMENTS (~130) ═══════════════════
  // Helper to generate file name
  const fn = (first: string, last: string, type: string) => `${first.toLowerCase()}_${last.toLowerCase().replace(/[ž]/g,'z').replace(/[ć]/g,'c')}_${type}`.replace(/\s+/g, '_') + '.pdf';

  const docs: any[] = [
    // Worker 1 — Rajesh Sharma (active, Koper)
    { worker_id: 1, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-001', issue_date: '2024-06-01', expiry_date: '2025-06-01', validity_status: 'expiring_soon', file_name: fn('Rajesh','Sharma','trc_slovenia_2024'), notes: 'Renewal application submitted' },
    { worker_id: 1, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135 P FW 1.2 S s8', issue_date: '2024-01-15', expiry_date: '2026-01-15', validity_status: 'valid', has_tuv: 1, file_name: fn('Rajesh','Sharma','en9606_tig_mig_cert') },
    { worker_id: 1, doc_type: 'passport', issue_date: '2022-03-10', expiry_date: '2032-03-10', validity_status: 'valid', file_name: fn('Rajesh','Sharma','passport_india') },
    { worker_id: 1, doc_type: 'employment_contract', issue_date: '2024-06-15', expiry_date: '2026-06-15', validity_status: 'valid', file_name: fn('Rajesh','Sharma','employment_contract_2024') },
    { worker_id: 1, doc_type: 'medical_cert', issue_date: '2025-01-10', expiry_date: '2026-01-10', validity_status: 'valid', file_name: fn('Rajesh','Sharma','medical_cert_2025') },
    { worker_id: 1, doc_type: 'safety_training', issue_date: '2024-10-05', expiry_date: '2025-10-05', validity_status: 'valid', file_name: fn('Rajesh','Sharma','safety_training_2024') },
    // Worker 2 — Arjun Patel
    { worker_id: 2, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-002', issue_date: '2024-09-01', expiry_date: '2025-03-01', validity_status: 'expired', file_name: fn('Arjun','Patel','trc_slovenia_2024'), notes: 'EXPIRED — Renewal in progress' },
    { worker_id: 2, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 111 P BW 1.2', issue_date: '2023-06-01', expiry_date: '2025-06-01', validity_status: 'expiring_soon', has_tuv: 1, file_name: fn('Arjun','Patel','en9606_stick_cert') },
    { worker_id: 2, doc_type: 'passport', issue_date: '2021-12-15', expiry_date: '2031-12-15', validity_status: 'valid', file_name: fn('Arjun','Patel','passport_india') },
    { worker_id: 2, doc_type: 'employment_contract', issue_date: '2024-09-01', expiry_date: '2026-09-01', validity_status: 'valid', file_name: fn('Arjun','Patel','employment_contract_2024') },
    // Worker 3 — Vikram Kumar (Graz, Austria)
    { worker_id: 3, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-003', issue_date: '2024-01-10', expiry_date: '2026-01-10', validity_status: 'valid', file_name: fn('Vikram','Kumar','trc_slovenia_2024') },
    { worker_id: 3, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135/141 P FW+BW', issue_date: '2024-03-01', expiry_date: '2026-03-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Vikram','Kumar','en9606_tig_saw_cert') },
    { worker_id: 3, doc_type: 'passport', issue_date: '2023-05-20', expiry_date: '2033-05-20', validity_status: 'valid', file_name: fn('Vikram','Kumar','passport_india') },
    { worker_id: 3, doc_type: 'a1_form', a1_country: 'Austria', issue_date: '2026-02-01', expiry_date: '2026-09-30', validity_status: 'valid', file_name: fn('Vikram','Kumar','a1_austria_2026') },
    { worker_id: 3, doc_type: 'medical_cert', issue_date: '2025-11-15', expiry_date: '2026-11-15', validity_status: 'valid', file_name: fn('Vikram','Kumar','medical_cert_2025') },
    // Worker 4 — Suresh Reddy
    { worker_id: 4, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-004', issue_date: '2024-11-01', expiry_date: '2025-11-01', validity_status: 'valid', file_name: fn('Suresh','Reddy','trc_slovenia_2024') },
    { worker_id: 4, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141 P FW', issue_date: '2024-06-01', expiry_date: '2026-06-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Suresh','Reddy','en9606_tig_cert') },
    { worker_id: 4, doc_type: 'passport', issue_date: '2023-08-10', expiry_date: '2033-08-10', validity_status: 'valid', file_name: fn('Suresh','Reddy','passport_india') },
    // Worker 5 — Pradeep Yadav
    { worker_id: 5, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2025-005', issue_date: '2025-02-01', expiry_date: '2026-02-01', validity_status: 'valid', file_name: fn('Pradeep','Yadav','trc_slovenia_2025') },
    { worker_id: 5, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135 P FW', issue_date: '2024-12-01', expiry_date: '2026-12-01', validity_status: 'valid', file_name: fn('Pradeep','Yadav','en9606_mig_cert') },
    { worker_id: 5, doc_type: 'passport', issue_date: '2024-01-05', expiry_date: '2034-01-05', validity_status: 'valid', file_name: fn('Pradeep','Yadav','passport_india') },
    // Worker 6 — Amit Singh
    { worker_id: 6, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2023-006', issue_date: '2023-09-15', expiry_date: '2025-09-15', validity_status: 'valid', file_name: fn('Amit','Singh','trc_slovenia_2023') },
    { worker_id: 6, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135/141/111 P FW+BW', issue_date: '2023-11-01', expiry_date: '2025-11-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Amit','Singh','en9606_multi_cert') },
    { worker_id: 6, doc_type: 'passport', issue_date: '2022-06-20', expiry_date: '2032-06-20', validity_status: 'valid', file_name: fn('Amit','Singh','passport_india') },
    { worker_id: 6, doc_type: 'safety_training', issue_date: '2024-10-01', expiry_date: '2025-10-01', validity_status: 'valid', file_name: fn('Amit','Singh','safety_training_2024') },
    // Worker 7 — Sanjay Gupta
    { worker_id: 7, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2025-007', issue_date: '2025-01-15', expiry_date: '2026-01-15', validity_status: 'valid', file_name: fn('Sanjay','Gupta','trc_slovenia_2025') },
    { worker_id: 7, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141 P BW', issue_date: '2024-09-01', expiry_date: '2026-09-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Sanjay','Gupta','en9606_tig_cert') },
    { worker_id: 7, doc_type: 'passport', issue_date: '2024-03-01', expiry_date: '2034-03-01', validity_status: 'valid', file_name: fn('Sanjay','Gupta','passport_india') },
    // Worker 8 — Rakesh Thakur (Krško)
    { worker_id: 8, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-008', issue_date: '2024-04-20', expiry_date: '2025-04-20', validity_status: 'expiring_soon', file_name: fn('Rakesh','Thakur','trc_slovenia_2024'), notes: 'Expiring soon — renew by March' },
    { worker_id: 8, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 136 P FW', issue_date: '2024-02-01', expiry_date: '2026-02-01', validity_status: 'valid', file_name: fn('Rakesh','Thakur','en9606_fcaw_cert') },
    { worker_id: 8, doc_type: 'passport', issue_date: '2022-11-10', expiry_date: '2032-11-10', validity_status: 'valid', file_name: fn('Rakesh','Thakur','passport_india') },
    // Worker 9 — Mahesh Nair (Krško)
    { worker_id: 9, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-009', issue_date: '2024-05-10', expiry_date: '2026-05-10', validity_status: 'valid', file_name: fn('Mahesh','Nair','trc_slovenia_2024') },
    { worker_id: 9, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141 T BW s3', issue_date: '2024-04-01', expiry_date: '2026-04-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Mahesh','Nair','en9606_tig_cert') },
    { worker_id: 9, doc_type: 'passport', issue_date: '2023-01-15', expiry_date: '2033-01-15', validity_status: 'valid', file_name: fn('Mahesh','Nair','passport_india') },
    // Worker 10 — Dinesh Verma
    { worker_id: 10, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2025-010', issue_date: '2025-03-01', expiry_date: '2026-03-01', validity_status: 'valid', file_name: fn('Dinesh','Verma','trc_slovenia_2025') },
    { worker_id: 10, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 111 P FW', issue_date: '2025-01-15', expiry_date: '2027-01-15', validity_status: 'valid', file_name: fn('Dinesh','Verma','en9606_stick_cert') },
    { worker_id: 10, doc_type: 'passport', issue_date: '2024-06-20', expiry_date: '2034-06-20', validity_status: 'valid', file_name: fn('Dinesh','Verma','passport_india') },
    // Worker 11 — Ravi Tiwari
    { worker_id: 11, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-011', issue_date: '2024-08-15', expiry_date: '2025-08-15', validity_status: 'valid', file_name: fn('Ravi','Tiwari','trc_slovenia_2024') },
    { worker_id: 11, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141 T FW', issue_date: '2024-05-01', expiry_date: '2026-05-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Ravi','Tiwari','en9606_tig_cert') },
    { worker_id: 11, doc_type: 'passport', issue_date: '2023-09-10', expiry_date: '2033-09-10', validity_status: 'valid', file_name: fn('Ravi','Tiwari','passport_india') },
    // Worker 13 — Ganesh Joshi (Graz)
    { worker_id: 13, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-013', issue_date: '2024-07-01', expiry_date: '2025-07-01', validity_status: 'expiring_soon', file_name: fn('Ganesh','Joshi','trc_slovenia_2024') },
    { worker_id: 13, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135 P BW', issue_date: '2024-04-15', expiry_date: '2026-04-15', validity_status: 'valid', file_name: fn('Ganesh','Joshi','en9606_mig_cert') },
    { worker_id: 13, doc_type: 'passport', issue_date: '2022-10-20', expiry_date: '2032-10-20', validity_status: 'valid', file_name: fn('Ganesh','Joshi','passport_india') },
    { worker_id: 13, doc_type: 'a1_form', a1_country: 'Austria', issue_date: '2026-02-01', expiry_date: '2026-09-30', validity_status: 'valid', file_name: fn('Ganesh','Joshi','a1_austria_2026') },
    // Worker 15 — Kishore Pillai (Krško)
    { worker_id: 15, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-015', issue_date: '2024-06-01', expiry_date: '2025-06-01', validity_status: 'expiring_soon', file_name: fn('Kishore','Pillai','trc_slovenia_2024'), notes: 'Renewal needed' },
    { worker_id: 15, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141/121 P BW', issue_date: '2024-03-01', expiry_date: '2026-03-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Kishore','Pillai','en9606_tig_saw_cert') },
    { worker_id: 15, doc_type: 'passport', issue_date: '2023-02-15', expiry_date: '2033-02-15', validity_status: 'valid', file_name: fn('Kishore','Pillai','passport_india') },
    // Worker 16 — Deepak Mishra
    { worker_id: 16, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2025-016', issue_date: '2025-01-10', expiry_date: '2026-01-10', validity_status: 'valid', file_name: fn('Deepak','Mishra','trc_slovenia_2025') },
    { worker_id: 16, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135/111 P FW', issue_date: '2024-10-01', expiry_date: '2026-10-01', validity_status: 'valid', file_name: fn('Deepak','Mishra','en9606_mig_stick_cert') },
    { worker_id: 16, doc_type: 'passport', issue_date: '2024-08-10', expiry_date: '2034-08-10', validity_status: 'valid', file_name: fn('Deepak','Mishra','passport_india') },
    // Worker 17 — Manish Pandey (Trieste, Italy)
    { worker_id: 17, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-017', issue_date: '2024-10-01', expiry_date: '2025-10-01', validity_status: 'valid', file_name: fn('Manish','Pandey','trc_slovenia_2024') },
    { worker_id: 17, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141 T BW s5', issue_date: '2024-08-01', expiry_date: '2026-08-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Manish','Pandey','en9606_tig_cert') },
    { worker_id: 17, doc_type: 'passport', issue_date: '2023-04-20', expiry_date: '2033-04-20', validity_status: 'valid', file_name: fn('Manish','Pandey','passport_india') },
    { worker_id: 17, doc_type: 'a1_form', a1_country: 'Italy', issue_date: '2026-03-01', expiry_date: '2026-08-30', validity_status: 'valid', file_name: fn('Manish','Pandey','a1_italy_2026') },
    // Worker 19 — Ashok Menon
    { worker_id: 19, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-019', issue_date: '2024-12-01', expiry_date: '2025-12-01', validity_status: 'valid', file_name: fn('Ashok','Menon','trc_slovenia_2024') },
    { worker_id: 19, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141/135 P FW', issue_date: '2024-10-01', expiry_date: '2026-10-01', validity_status: 'valid', file_name: fn('Ashok','Menon','en9606_tig_mig_cert') },
    { worker_id: 19, doc_type: 'passport', issue_date: '2024-09-15', expiry_date: '2034-09-15', validity_status: 'valid', file_name: fn('Ashok','Menon','passport_india') },
    // Worker 20 — Ramesh Iyer (Graz)
    { worker_id: 20, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2023-020', issue_date: '2023-05-01', expiry_date: '2025-05-01', validity_status: 'expiring_soon', file_name: fn('Ramesh','Iyer','trc_slovenia_2023'), notes: 'Expiring soon — renewal in progress' },
    { worker_id: 20, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141/135/121 P FW+BW', issue_date: '2023-06-01', expiry_date: '2025-06-01', validity_status: 'expiring_soon', has_tuv: 1, file_name: fn('Ramesh','Iyer','en9606_multi_cert'), notes: 'Re-certification needed' },
    { worker_id: 20, doc_type: 'passport', issue_date: '2021-03-10', expiry_date: '2031-03-10', validity_status: 'valid', file_name: fn('Ramesh','Iyer','passport_india') },
    { worker_id: 20, doc_type: 'a1_form', a1_country: 'Austria', issue_date: '2026-02-01', expiry_date: '2026-09-30', validity_status: 'valid', file_name: fn('Ramesh','Iyer','a1_austria_2026') },
    // Worker 21 — Mark Santos (Graz)
    { worker_id: 21, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-021', issue_date: '2024-03-15', expiry_date: '2026-03-15', validity_status: 'valid', file_name: fn('Mark','Santos','trc_slovenia_2024') },
    { worker_id: 21, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135/141/111 P FW+BW', issue_date: '2024-02-01', expiry_date: '2026-02-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Mark','Santos','en9606_multi_cert') },
    { worker_id: 21, doc_type: 'passport', issue_date: '2021-08-20', expiry_date: '2031-08-20', validity_status: 'valid', file_name: fn('Mark','Santos','passport_philippines') },
    { worker_id: 21, doc_type: 'a1_form', a1_country: 'Austria', issue_date: '2026-02-01', expiry_date: '2026-09-30', validity_status: 'valid', file_name: fn('Mark','Santos','a1_austria_2026') },
    // Worker 22 — Jose Reyes (Graz)
    { worker_id: 22, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2023-022', issue_date: '2023-11-01', expiry_date: '2025-11-01', validity_status: 'valid', file_name: fn('Jose','Reyes','trc_slovenia_2023') },
    { worker_id: 22, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141/121 P BW s12', issue_date: '2023-09-01', expiry_date: '2025-09-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Jose','Reyes','en9606_tig_saw_cert') },
    { worker_id: 22, doc_type: 'passport', issue_date: '2022-05-15', expiry_date: '2032-05-15', validity_status: 'valid', file_name: fn('Jose','Reyes','passport_philippines') },
    { worker_id: 22, doc_type: 'a1_form', a1_country: 'Austria', issue_date: '2026-02-01', expiry_date: '2026-09-30', validity_status: 'valid', file_name: fn('Jose','Reyes','a1_austria_2026') },
    // Worker 23 — Carlo Garcia (Maribor)
    { worker_id: 23, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-023', issue_date: '2024-08-15', expiry_date: '2025-08-15', validity_status: 'valid', file_name: fn('Carlo','Garcia','trc_slovenia_2024') },
    { worker_id: 23, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135/111 P FW', issue_date: '2024-06-01', expiry_date: '2026-06-01', validity_status: 'valid', file_name: fn('Carlo','Garcia','en9606_mig_stick_cert') },
    { worker_id: 23, doc_type: 'passport', issue_date: '2023-02-10', expiry_date: '2033-02-10', validity_status: 'valid', file_name: fn('Carlo','Garcia','passport_philippines') },
    // Worker 24 — Miguel Ramos (Trieste)
    { worker_id: 24, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-024', issue_date: '2024-09-01', expiry_date: '2025-09-01', validity_status: 'valid', file_name: fn('Miguel','Ramos','trc_slovenia_2024') },
    { worker_id: 24, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141 T BW', issue_date: '2024-07-01', expiry_date: '2026-07-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Miguel','Ramos','en9606_tig_cert') },
    { worker_id: 24, doc_type: 'passport', issue_date: '2023-06-20', expiry_date: '2033-06-20', validity_status: 'valid', file_name: fn('Miguel','Ramos','passport_philippines') },
    { worker_id: 24, doc_type: 'a1_form', a1_country: 'Italy', issue_date: '2026-03-01', expiry_date: '2026-08-30', validity_status: 'valid', file_name: fn('Miguel','Ramos','a1_italy_2026') },
    // Worker 25 — Paolo Cruz (Krško)
    { worker_id: 25, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-025', issue_date: '2024-07-20', expiry_date: '2025-07-20', validity_status: 'expiring_soon', file_name: fn('Paolo','Cruz','trc_slovenia_2024') },
    { worker_id: 25, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135 P FW', issue_date: '2024-05-01', expiry_date: '2026-05-01', validity_status: 'valid', file_name: fn('Paolo','Cruz','en9606_mig_cert') },
    { worker_id: 25, doc_type: 'passport', issue_date: '2023-10-05', expiry_date: '2033-10-05', validity_status: 'valid', file_name: fn('Paolo','Cruz','passport_philippines') },
    // Worker 26 — Antonio Bautista (Koper)
    { worker_id: 26, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-026', issue_date: '2024-05-10', expiry_date: '2026-05-10', validity_status: 'valid', file_name: fn('Antonio','Bautista','trc_slovenia_2024') },
    { worker_id: 26, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141/135 T BW', issue_date: '2024-03-15', expiry_date: '2026-03-15', validity_status: 'valid', has_tuv: 1, file_name: fn('Antonio','Bautista','en9606_tig_mig_cert') },
    { worker_id: 26, doc_type: 'passport', issue_date: '2022-12-01', expiry_date: '2032-12-01', validity_status: 'valid', file_name: fn('Antonio','Bautista','passport_philippines') },
    // Worker 27 — Rafael Aquino (on_leave)
    { worker_id: 27, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-027', issue_date: '2024-11-01', expiry_date: '2025-05-01', validity_status: 'expiring_soon', file_name: fn('Rafael','Aquino','trc_slovenia_2024'), notes: 'TRC renewal in progress — reason for leave' },
    { worker_id: 27, doc_type: 'passport', issue_date: '2023-07-15', expiry_date: '2033-07-15', validity_status: 'valid', file_name: fn('Rafael','Aquino','passport_philippines') },
    // Worker 29 — Suman Thapa (on_leave)
    { worker_id: 29, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2025-029', issue_date: '2025-01-10', expiry_date: '2026-01-10', validity_status: 'valid', file_name: fn('Suman','Thapa','trc_slovenia_2025') },
    { worker_id: 29, doc_type: 'passport', issue_date: '2024-05-01', expiry_date: '2034-05-01', validity_status: 'valid', file_name: fn('Suman','Thapa','passport_nepal') },
    // Worker 30 — Bikram Gurung (Maribor)
    { worker_id: 30, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-030', issue_date: '2024-10-15', expiry_date: '2025-10-15', validity_status: 'valid', file_name: fn('Bikram','Gurung','trc_slovenia_2024') },
    { worker_id: 30, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141/135 P FW', issue_date: '2024-08-01', expiry_date: '2026-08-01', validity_status: 'valid', file_name: fn('Bikram','Gurung','en9606_tig_mig_cert') },
    { worker_id: 30, doc_type: 'passport', issue_date: '2024-02-10', expiry_date: '2034-02-10', validity_status: 'valid', file_name: fn('Bikram','Gurung','passport_nepal') },
    // Worker 31 — Prakash Tamang (Koper)
    { worker_id: 31, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-031', issue_date: '2024-12-01', expiry_date: '2025-12-01', validity_status: 'valid', file_name: fn('Prakash','Tamang','trc_slovenia_2024') },
    { worker_id: 31, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 111 P FW', issue_date: '2024-11-01', expiry_date: '2026-11-01', validity_status: 'valid', file_name: fn('Prakash','Tamang','en9606_stick_cert') },
    { worker_id: 31, doc_type: 'passport', issue_date: '2024-06-15', expiry_date: '2034-06-15', validity_status: 'valid', file_name: fn('Prakash','Tamang','passport_nepal') },
    // Worker 33 — Chaminda Silva (Krško)
    { worker_id: 33, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-033', issue_date: '2024-08-01', expiry_date: '2025-08-01', validity_status: 'valid', file_name: fn('Chaminda','Silva','trc_slovenia_2024') },
    { worker_id: 33, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141 P BW s8', issue_date: '2024-06-01', expiry_date: '2026-06-01', validity_status: 'valid', has_tuv: 1, file_name: fn('Chaminda','Silva','en9606_tig_cert') },
    { worker_id: 33, doc_type: 'passport', issue_date: '2023-03-20', expiry_date: '2033-03-20', validity_status: 'valid', file_name: fn('Chaminda','Silva','passport_sri_lanka') },
    // Worker 34 — Nuwan Perera (Maribor)
    { worker_id: 34, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-034', issue_date: '2024-09-15', expiry_date: '2025-09-15', validity_status: 'valid', file_name: fn('Nuwan','Perera','trc_slovenia_2024') },
    { worker_id: 34, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135/111 P FW', issue_date: '2024-07-01', expiry_date: '2026-07-01', validity_status: 'valid', file_name: fn('Nuwan','Perera','en9606_mig_stick_cert') },
    { worker_id: 34, doc_type: 'passport', issue_date: '2023-11-05', expiry_date: '2033-11-05', validity_status: 'valid', file_name: fn('Nuwan','Perera','passport_sri_lanka') },
    // Worker 35 — Emir Hodžić (Graz — EU citizen, no TRC needed)
    { worker_id: 35, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 141/135/121 P FW+BW', issue_date: '2023-01-15', expiry_date: '2025-01-15', validity_status: 'expired', has_tuv: 1, file_name: fn('Emir','Hodžić','en9606_multi_cert'), notes: 'EXPIRED — needs re-certification' },
    { worker_id: 35, doc_type: 'passport', issue_date: '2020-08-10', expiry_date: '2030-08-10', validity_status: 'valid', file_name: fn('Emir','Hodžić','passport_bosnia') },
    { worker_id: 35, doc_type: 'a1_form', a1_country: 'Austria', issue_date: '2026-02-01', expiry_date: '2026-09-30', validity_status: 'valid', file_name: fn('Emir','Hodžić','a1_austria_2026') },
    { worker_id: 35, doc_type: 'employment_contract', issue_date: '2023-03-01', expiry_date: '2026-03-01', validity_status: 'valid', file_name: fn('Emir','Hodžić','employment_contract_2023') },
  ];
  docs.forEach((d) => pushDoc(s.worker_documents, d));

  // ═══════════════════ PIPELINE CANDIDATES (10) ═══════════════════
  const pipeline: any[] = [
    { first_name: 'Arun', last_name: 'Mehta', nationality: 'Indian', phone: '+91 98765 00011', email: 'arun.mehta@example.com', stage: 'interested', expected_arrival_date: '2026-08-01', notes: 'TIG welder, 4 years experience. Contacted via agency.' },
    { first_name: 'Rohit', last_name: 'Sharma', nationality: 'Indian', phone: '+91 91234 00022', email: 'rohit.s@example.com', stage: 'interested', expected_arrival_date: '2026-08-15', notes: 'MIG welder. Referred by Rajesh Sharma.' },
    { first_name: 'Dennis', last_name: 'Villanueva', nationality: 'Filipino', phone: '+63 918 000 1111', email: 'dennis.v@example.com', stage: 'test_scheduled', expected_arrival_date: '2026-07-01', notes: 'TIG/MIG welder. Test scheduled March 10.' },
    { first_name: 'Raj', last_name: 'Bahadur', nationality: 'Nepalese', phone: '+977 985 0001111', email: 'raj.bahadur@example.com', stage: 'test_scheduled', expected_arrival_date: '2026-07-15', notes: 'Stick welder. Test scheduled March 12.' },
    { first_name: 'Vijay', last_name: 'Sharma', nationality: 'Indian', phone: '+91 99888 00033', email: 'vijay.s@example.com', stage: 'test_passed', expected_arrival_date: '2026-06-15', notes: 'Passed TIG test with excellent marks. Starting document collection.' },
    { first_name: 'Ernesto', last_name: 'Reyes', nationality: 'Filipino', phone: '+63 919 000 2222', email: 'ernesto.r@example.com', stage: 'test_passed', expected_arrival_date: '2026-06-20', notes: 'Passed MIG/Stick test. Good candidate for Maribor bridge project.' },
    { first_name: 'Vikram', last_name: 'Singh', nationality: 'Indian', phone: '+91 99887 76655', email: 'vikram.singh@example.com', stage: 'docs_collecting', expected_arrival_date: '2026-05-15', notes: 'TIG welder, 5 years experience. Collecting documents.' },
    { first_name: 'Carlo', last_name: 'Dela Cruz', nationality: 'Filipino', phone: '+63 918 765 4321', email: 'carlo.dc@example.com', stage: 'docs_collecting', expected_arrival_date: '2026-06-01', notes: 'MIG specialist. Most documents collected.' },
    { first_name: 'Sunil', last_name: 'Prasad', nationality: 'Indian', phone: '+91 96543 00044', email: 'sunil.p@example.com', stage: 'visa_applied', expected_arrival_date: '2026-04-15', notes: 'All docs submitted. Visa application in process at embassy.' },
    { first_name: 'Arnel', last_name: 'Tan', nationality: 'Filipino', phone: '+63 920 000 3333', email: 'arnel.t@example.com', stage: 'visa_approved', expected_arrival_date: '2026-03-20', notes: 'Visa approved! Booking flights. Expected arrival March 20.' },
  ];
  pipeline.forEach((c) => push(s.pipeline_candidates, c));

  // Pipeline documents
  const pipeDocTypes = ['certified_passport','power_of_attorney','signature_form','criminal_record','tuv_certs','employment_contract','photo'];
  // Define received counts per candidate [candidateId, receivedCount]
  const pipeDocCounts: [number, number][] = [[1,0],[2,1],[3,1],[4,2],[5,3],[6,3],[7,4],[8,5],[9,7],[10,7]];
  pipeDocCounts.forEach(([cId, count]) => {
    pipeDocTypes.forEach((dt, i) => {
      const received = i < count ? 1 : 0;
      s.pipeline_documents.rows.push({
        id: s.pipeline_documents.autoId++,
        candidate_id: cId, doc_type: dt,
        is_received: received,
        received_date: received ? '2026-02-' + String(10 + i).padStart(2, '0') : null,
        notes: null, created_at: now(),
      });
    });
  });

  // ═══════════════════ EXPENSES (~45) ═══════════════════
  const expenses: any[] = [
    // October 2025
    { project_id: 1, worker_id: null, category_id: 3, amount: 1200, description: 'Worker apartment Koper — October rent', expense_date: '2025-10-01', is_recurring: 1, recurrence_interval: 'monthly', notes: '3-bedroom for 6 workers' },
    { project_id: 6, worker_id: null, category_id: 3, amount: 900, description: 'Worker apartment Krško — October rent', expense_date: '2025-10-01', is_recurring: 1, recurrence_interval: 'monthly', notes: '2-bedroom for 4 workers' },
    { project_id: 1, worker_id: null, category_id: 5, amount: 850, description: 'Welding rods, wire, gas cylinders', expense_date: '2025-10-05', is_recurring: 0 },
    { project_id: 6, worker_id: null, category_id: 5, amount: 620, description: 'Tungsten electrodes and filler rods', expense_date: '2025-10-08', is_recurring: 0 },
    { project_id: 1, worker_id: 1, category_id: 1, amount: 180, description: 'Bus tickets Ljubljana-Koper team', expense_date: '2025-10-02', is_recurring: 0 },
    { project_id: 6, worker_id: null, category_id: 4, amount: 3600, description: 'Per diem Krško team — October (6 workers × €20/day × 30)', expense_date: '2025-10-31', is_recurring: 1, recurrence_interval: 'monthly' },
    // November 2025
    { project_id: 1, worker_id: null, category_id: 3, amount: 1200, description: 'Worker apartment Koper — November rent', expense_date: '2025-11-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 6, worker_id: null, category_id: 3, amount: 900, description: 'Worker apartment Krško — November rent', expense_date: '2025-11-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 4, worker_id: null, category_id: 3, amount: 1100, description: 'Worker apartment Maribor — November rent', expense_date: '2025-11-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 1, worker_id: null, category_id: 5, amount: 1200, description: 'Welding equipment maintenance', expense_date: '2025-11-10', is_recurring: 0 },
    { project_id: 4, worker_id: null, category_id: 5, amount: 950, description: 'Bridge welding safety harnesses', expense_date: '2025-11-15', is_recurring: 0, notes: 'Fall protection equipment for bridge work' },
    { project_id: 6, worker_id: null, category_id: 4, amount: 3600, description: 'Per diem Krško team — November', expense_date: '2025-11-30', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 1, worker_id: null, category_id: 4, amount: 5400, description: 'Per diem Koper team — November (9 workers × €20 × 30)', expense_date: '2025-11-30', is_recurring: 1, recurrence_interval: 'monthly' },
    // December 2025
    { project_id: 1, worker_id: null, category_id: 3, amount: 1200, description: 'Worker apartment Koper — December rent', expense_date: '2025-12-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 6, worker_id: null, category_id: 3, amount: 900, description: 'Worker apartment Krško — December rent', expense_date: '2025-12-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 4, worker_id: null, category_id: 3, amount: 1100, description: 'Worker apartment Maribor — December rent', expense_date: '2025-12-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 4, worker_id: null, category_id: 1, amount: 560, description: 'Van rental Maribor — December', expense_date: '2025-12-05', is_recurring: 0 },
    { project_id: 1, worker_id: 6, category_id: 6, amount: 150, description: 'TRC renewal fee — Amit Singh', expense_date: '2025-12-10', is_recurring: 0 },
    { project_id: 6, worker_id: null, category_id: 4, amount: 3000, description: 'Per diem Krško team — December (reduced holidays)', expense_date: '2025-12-31', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 1, worker_id: null, category_id: 4, amount: 4500, description: 'Per diem Koper team — December', expense_date: '2025-12-31', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 4, worker_id: null, category_id: 4, amount: 4200, description: 'Per diem Maribor team — December (7 workers)', expense_date: '2025-12-31', is_recurring: 1, recurrence_interval: 'monthly' },
    // January 2026
    { project_id: 1, worker_id: null, category_id: 3, amount: 1200, description: 'Worker apartment Koper — January rent', expense_date: '2026-01-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 6, worker_id: null, category_id: 3, amount: 900, description: 'Worker apartment Krško — January rent', expense_date: '2026-01-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 4, worker_id: null, category_id: 3, amount: 1100, description: 'Worker apartment Maribor — January rent', expense_date: '2026-01-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 1, worker_id: 1, category_id: 1, amount: 450, description: 'Bus tickets Koper roundtrip — team transport', expense_date: '2026-01-15', is_recurring: 0 },
    { project_id: 1, worker_id: null, category_id: 5, amount: 780, description: 'Welding rods and consumables', expense_date: '2026-01-20', is_recurring: 0 },
    { project_id: 4, worker_id: null, category_id: 5, amount: 420, description: 'Bridge inspection tools', expense_date: '2026-01-22', is_recurring: 0 },
    { project_id: 6, worker_id: null, category_id: 4, amount: 3600, description: 'Per diem Krško team — January', expense_date: '2026-01-31', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 1, worker_id: null, category_id: 4, amount: 5400, description: 'Per diem Koper team — January', expense_date: '2026-01-31', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 4, worker_id: null, category_id: 4, amount: 4200, description: 'Per diem Maribor team — January', expense_date: '2026-01-31', is_recurring: 1, recurrence_interval: 'monthly' },
    // February 2026
    { project_id: 1, worker_id: null, category_id: 3, amount: 1200, description: 'Worker apartment Koper — February rent', expense_date: '2026-02-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 6, worker_id: null, category_id: 3, amount: 900, description: 'Worker apartment Krško — February rent', expense_date: '2026-02-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 4, worker_id: null, category_id: 3, amount: 1100, description: 'Worker apartment Maribor — February rent', expense_date: '2026-02-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 2, worker_id: null, category_id: 3, amount: 1500, description: 'Worker apartment Graz — February rent', expense_date: '2026-02-01', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 2, worker_id: null, category_id: 6, amount: 750, description: 'A1 form processing fees — 5 workers Austria', expense_date: '2026-02-03', is_recurring: 0, notes: 'For workers posted to Graz project' },
    { project_id: 2, worker_id: 3, category_id: 1, amount: 320, description: 'Train tickets Ljubljana-Graz', expense_date: '2026-02-14', is_recurring: 0 },
    { project_id: 2, worker_id: null, category_id: 2, amount: 480, description: 'Diesel fuel — van Graz roundtrip', expense_date: '2026-02-15', is_recurring: 0 },
    { project_id: 5, worker_id: null, category_id: 6, amount: 400, description: 'A1 form processing fees — 2 workers Italy', expense_date: '2026-02-10', is_recurring: 0 },
    { project_id: 1, worker_id: null, category_id: 5, amount: 560, description: 'Stainless steel filler wire', expense_date: '2026-02-12', is_recurring: 0 },
    { project_id: 4, worker_id: null, category_id: 7, amount: 350, description: 'NDT inspection services — bridge welds', expense_date: '2026-02-18', is_recurring: 0 },
    { project_id: 6, worker_id: null, category_id: 4, amount: 3000, description: 'Per diem Krško team — February', expense_date: '2026-02-28', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 1, worker_id: null, category_id: 4, amount: 5400, description: 'Per diem Koper team — February', expense_date: '2026-02-28', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 4, worker_id: null, category_id: 4, amount: 4200, description: 'Per diem Maribor team — February', expense_date: '2026-02-28', is_recurring: 1, recurrence_interval: 'monthly' },
    { project_id: 2, worker_id: null, category_id: 4, amount: 2000, description: 'Per diem Graz team — February (5 workers × half month)', expense_date: '2026-02-28', is_recurring: 1, recurrence_interval: 'monthly' },
  ];
  expenses.forEach((e) => push(s.expenses, e));

  // ═══════════════════ NOTIFICATIONS ═══════════════════
  const notifs = [
    { user_id: 1, type: 'system', title: 'Welcome to LinkedWeld Pro!', message: 'Your account is ready. Start managing your welding team.', is_read: 1 },
    { user_id: 1, type: 'alert', title: 'TRC Expiring: Arjun Patel', message: 'TRC has expired. Immediate renewal required.', is_read: 0 },
    { user_id: 1, type: 'alert', title: 'TRC Expiring: Rajesh Sharma', message: 'TRC expires within 90 days. Schedule renewal.', is_read: 0 },
    { user_id: 1, type: 'info', title: 'Krško project at 90%', message: 'Nuclear plant shutdown project nearing completion.', is_read: 0 },
    { user_id: 1, type: 'alert', title: 'Welding Cert Expired: Emir Hodžić', message: 'EN ISO 9606-1 multi-process cert has expired.', is_read: 0 },
    { user_id: 1, type: 'info', title: 'New pipeline candidate', message: 'Arnel Tan visa approved — arriving March 20.', is_read: 0 },
    { user_id: 1, type: 'alert', title: 'Budget Warning: Koper Refinery', message: 'Labor costs at 68% of budget with 35% work remaining.', is_read: 0 },
    { user_id: 1, type: 'info', title: 'Graz project mobilization started', message: '5 workers assigned. A1 forms submitted.', is_read: 1 },
    { user_id: 1, type: 'system', title: 'Munich project planning', message: 'BASF project added. Start planning worker assignments.', is_read: 0 },
    { user_id: 1, type: 'alert', title: 'Multiple TRCs expiring soon', message: '6 workers have TRCs expiring within 90 days.', is_read: 0 },
  ];
  notifs.forEach((n) => push(s.notifications, n));

  console.log('LinkedWeld Pro store initialized: 35 workers, 8 projects, 10 pipeline candidates, 45 expenses');
  return s;
}

function getStore(): Store {
  if (!store) store = initStore();
  return store;
}

export interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

export interface SimpleDB {
  insert(table: string, row: Record<string, any>): RunResult;
  findOne(table: string, predicate: (row: any) => boolean): any | undefined;
  findAll(table: string, predicate?: (row: any) => boolean): any[];
  update(table: string, predicate: (row: any) => boolean, updates: Record<string, any>): number;
  remove(table: string, predicate: (row: any) => boolean): number;
  count(table: string, predicate?: (row: any) => boolean): number;
  sum(table: string, field: string, predicate?: (row: any) => boolean): number;
  countDistinct(table: string, field: string, predicate?: (row: any) => boolean): number;
}

export function getDb(): SimpleDB {
  const s = getStore();

  return {
    insert(table: string, row: Record<string, any>): RunResult {
      const t = s[table];
      if (!t) return { changes: 0, lastInsertRowid: 0 };
      const id = t.autoId++;
      const newRow = { id, created_at: now(), updated_at: now(), ...row };
      t.rows.push(newRow);
      return { changes: 1, lastInsertRowid: id };
    },

    findOne(table: string, predicate: (row: any) => boolean): any | undefined {
      const t = s[table];
      if (!t) return undefined;
      return t.rows.find(predicate);
    },

    findAll(table: string, predicate?: (row: any) => boolean): any[] {
      const t = s[table];
      if (!t) return [];
      return predicate ? t.rows.filter(predicate) : [...t.rows];
    },

    update(table: string, predicate: (row: any) => boolean, updates: Record<string, any>): number {
      const t = s[table];
      if (!t) return 0;
      let count = 0;
      t.rows.forEach((row, i) => {
        if (predicate(row)) {
          t.rows[i] = { ...row, ...updates, updated_at: now() };
          count++;
        }
      });
      return count;
    },

    remove(table: string, predicate: (row: any) => boolean): number {
      const t = s[table];
      if (!t) return 0;
      const before = t.rows.length;
      t.rows = t.rows.filter((row) => !predicate(row));
      return before - t.rows.length;
    },

    count(table: string, predicate?: (row: any) => boolean): number {
      const t = s[table];
      if (!t) return 0;
      return predicate ? t.rows.filter(predicate).length : t.rows.length;
    },

    sum(table: string, field: string, predicate?: (row: any) => boolean): number {
      const t = s[table];
      if (!t) return 0;
      const rows = predicate ? t.rows.filter(predicate) : t.rows;
      return rows.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
    },

    countDistinct(table: string, field: string, predicate?: (row: any) => boolean): number {
      const t = s[table];
      if (!t) return 0;
      const rows = predicate ? t.rows.filter(predicate) : t.rows;
      const vals = new Set(rows.map((r) => r[field]).filter(Boolean));
      return vals.size;
    },
  };
}
