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

  // Seed expense categories
  const cats = [
    { name: 'Transport', icon: 'Car', color: '#3b82f6' },
    { name: 'Fuel', icon: 'Fuel', color: '#8b5cf6' },
    { name: 'Accommodation', icon: 'Home', color: '#10b981' },
    { name: 'Per Diem', icon: 'Wallet', color: '#f59e0b' },
    { name: 'Tools/Equipment', icon: 'Wrench', color: '#ef4444' },
    { name: 'Permits/Fees', icon: 'FileText', color: '#6366f1' },
    { name: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
  ];
  cats.forEach((c) => {
    s.expense_categories.rows.push({ id: s.expense_categories.autoId++, ...c, created_at: now(), updated_at: now() });
  });

  // Seed demo workers
  const demoWorkers = [
    { first_name: 'Rajesh', last_name: 'Sharma', nationality: 'Indian', phone: '+91 98765 43210', email: 'rajesh@example.com', hourly_rate: 18, welding_types: JSON.stringify(['TIG', 'MIG']), current_project_id: 1, status: 'active', employment_start_date: '2024-06-15', notes: 'Experienced TIG welder, 8 years experience' },
    { first_name: 'Arjun', last_name: 'Patel', nationality: 'Indian', phone: '+91 91234 56789', email: 'arjun@example.com', hourly_rate: 16, welding_types: JSON.stringify(['Stick', 'Flux-Cored']), current_project_id: 1, status: 'active', employment_start_date: '2024-09-01', notes: 'Stick welding specialist' },
    { first_name: 'Mark', last_name: 'Santos', nationality: 'Filipino', phone: '+63 912 345 6789', email: 'mark@example.com', hourly_rate: 17, welding_types: JSON.stringify(['TIG', 'MIG', 'Stick']), current_project_id: 2, status: 'active', employment_start_date: '2024-03-20', notes: 'Multi-process welder, very reliable' },
    { first_name: 'Suman', last_name: 'Thapa', nationality: 'Nepalese', phone: '+977 984 1234567', email: 'suman@example.com', hourly_rate: 15, welding_types: JSON.stringify(['MIG']), current_project_id: null, status: 'on_leave', employment_start_date: '2025-01-10', notes: 'On leave for visa renewal' },
    { first_name: 'Jose', last_name: 'Reyes', nationality: 'Filipino', phone: '+63 917 654 3210', email: 'jose@example.com', hourly_rate: 19, welding_types: JSON.stringify(['TIG', 'SAW']), current_project_id: 2, status: 'active', employment_start_date: '2023-11-05', notes: 'SAW specialist, pipeline experience' },
  ];
  demoWorkers.forEach((w) => {
    s.workers.rows.push({ id: s.workers.autoId++, ...w, created_at: now(), updated_at: now() });
  });

  // Seed worker documents
  const demoDocuments = [
    { worker_id: 1, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-001', issue_date: '2024-06-01', expiry_date: '2025-06-01', validity_status: 'expiring_soon', notes: 'Needs renewal soon' },
    { worker_id: 1, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 135 P FW 1.2', issue_date: '2024-01-15', expiry_date: '2026-01-15', validity_status: 'valid', has_tuv: 1 },
    { worker_id: 1, doc_type: 'passport', issue_date: '2022-03-10', expiry_date: '2032-03-10', validity_status: 'valid' },
    { worker_id: 2, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-002', issue_date: '2024-09-01', expiry_date: '2025-03-01', validity_status: 'expired', notes: 'EXPIRED - Renewal in progress' },
    { worker_id: 2, doc_type: 'welding_cert', welding_scope: 'EN ISO 9606-1 111 P BW', issue_date: '2023-06-01', expiry_date: '2025-06-01', validity_status: 'expiring_soon' },
    { worker_id: 3, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2024-003', issue_date: '2024-03-15', expiry_date: '2026-03-15', validity_status: 'valid' },
    { worker_id: 3, doc_type: 'passport', issue_date: '2021-08-20', expiry_date: '2031-08-20', validity_status: 'valid' },
    { worker_id: 5, doc_type: 'trc', trc_country: 'Slovenia', trc_number: 'TRC-2023-005', issue_date: '2023-11-01', expiry_date: '2025-11-01', validity_status: 'valid' },
    { worker_id: 5, doc_type: 'a1_form', a1_country: 'Austria', issue_date: '2025-01-01', expiry_date: '2025-12-31', validity_status: 'valid' },
  ];
  demoDocuments.forEach((d) => {
    s.worker_documents.rows.push({ id: s.worker_documents.autoId++, ...d, upload_status: 'uploaded', file_name: null, created_at: now() });
  });

  // Seed demo projects
  const demoProjects = [
    { name: 'Koper Refinery Maintenance', client: 'Petrol d.d.', location: 'Koper', country: 'Slovenia', phase: 'active', start_date: '2025-10-01', expected_end_date: '2026-06-30', progress: 65, budget_labor: 45000, budget_transport: 8000, budget_accommodation: 12000, budget_tools: 5000, budget_per_diem: 6000, budget_other: 4000, actual_labor: 32000, actual_transport: 5500, actual_accommodation: 9000, actual_tools: 3200, actual_per_diem: 4100, actual_other: 2800, notes: 'Annual maintenance shutdown. TIG and MIG welding on stainless steel piping.' },
    { name: 'Graz Pipeline Extension', client: 'OMV AG', location: 'Graz', country: 'Austria', phase: 'mobilization', start_date: '2026-02-15', expected_end_date: '2026-09-30', progress: 10, budget_labor: 60000, budget_transport: 12000, budget_accommodation: 18000, budget_tools: 8000, budget_per_diem: 9000, budget_other: 5000, actual_labor: 0, actual_transport: 2000, actual_accommodation: 0, actual_tools: 1500, actual_per_diem: 0, actual_other: 500, notes: 'New pipeline section. SAW and TIG welding required. A1 forms needed for Austria.' },
    { name: 'Ljubljana Storage Tanks', client: 'Nafta Lendava', location: 'Ljubljana', country: 'Slovenia', phase: 'completed', start_date: '2025-04-01', expected_end_date: '2025-12-15', progress: 100, budget_labor: 30000, budget_transport: 5000, budget_accommodation: 8000, budget_tools: 3000, budget_per_diem: 4000, budget_other: 2000, actual_labor: 28000, actual_transport: 4800, actual_accommodation: 7500, actual_tools: 2900, actual_per_diem: 3800, actual_other: 1500, notes: 'Completed on time. All welds passed NDT inspection.' },
  ];
  demoProjects.forEach((p) => {
    s.projects.rows.push({ id: s.projects.autoId++, ...p, created_at: now(), updated_at: now() });
  });

  // Seed project_workers
  [{ project_id: 1, worker_id: 1, assigned_date: '2025-10-01' }, { project_id: 1, worker_id: 2, assigned_date: '2025-10-01' }, { project_id: 2, worker_id: 3, assigned_date: '2026-02-15' }, { project_id: 2, worker_id: 5, assigned_date: '2026-02-15' }].forEach((pw) => {
    s.project_workers.rows.push({ id: s.project_workers.autoId++, ...pw, removed_date: null, created_at: now() });
  });

  // Seed pipeline candidates
  const demoPipeline = [
    { first_name: 'Vikram', last_name: 'Singh', nationality: 'Indian', phone: '+91 99887 76655', email: 'vikram@example.com', stage: 'docs_collecting', expected_arrival_date: '2026-05-15', notes: 'TIG welder, 5 years experience. Good references.' },
    { first_name: 'Carlo', last_name: 'Dela Cruz', nationality: 'Filipino', phone: '+63 918 765 4321', email: 'carlo@example.com', stage: 'test_scheduled', expected_arrival_date: '2026-06-01', notes: 'MIG specialist. Test scheduled for March 5.' },
  ];
  demoPipeline.forEach((c) => {
    s.pipeline_candidates.rows.push({ id: s.pipeline_candidates.autoId++, ...c, created_at: now(), updated_at: now() });
  });

  // Seed pipeline documents
  [{ candidate_id: 1, doc_type: 'certified_passport', is_received: 1, received_date: '2026-01-15' }, { candidate_id: 1, doc_type: 'power_of_attorney', is_received: 1, received_date: '2026-01-20' }, { candidate_id: 1, doc_type: 'criminal_record', is_received: 0 }, { candidate_id: 1, doc_type: 'tuv_certs', is_received: 1, received_date: '2026-02-01' }, { candidate_id: 2, doc_type: 'certified_passport', is_received: 1, received_date: '2026-02-10' }].forEach((d) => {
    s.pipeline_documents.rows.push({ id: s.pipeline_documents.autoId++, ...d, notes: null, created_at: now() });
  });

  // Seed some demo expenses
  const demoExpenses = [
    { project_id: 1, worker_id: 1, category_id: 1, amount: 450, description: 'Bus tickets Koper roundtrip', expense_date: '2026-01-15', is_recurring: 0, notes: null },
    { project_id: 1, worker_id: null, category_id: 3, amount: 1200, description: 'Worker apartment rent January', expense_date: '2026-01-01', is_recurring: 1, recurrence_interval: 'monthly', notes: '3-bedroom apartment for 4 workers' },
    { project_id: 1, worker_id: null, category_id: 5, amount: 350, description: 'Welding rods and wire', expense_date: '2026-01-20', is_recurring: 0, notes: null },
    { project_id: 2, worker_id: 3, category_id: 1, amount: 280, description: 'Train tickets to Graz', expense_date: '2026-02-14', is_recurring: 0, notes: null },
    { project_id: 2, worker_id: null, category_id: 6, amount: 500, description: 'A1 form processing fees', expense_date: '2026-02-01', is_recurring: 0, notes: 'For 2 workers posted to Austria' },
  ];
  demoExpenses.forEach((e) => {
    s.expenses.rows.push({ id: s.expenses.autoId++, ...e, created_at: now(), updated_at: now() });
  });

  console.log('LinkedWeld Pro in-memory store initialized with demo data');
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
