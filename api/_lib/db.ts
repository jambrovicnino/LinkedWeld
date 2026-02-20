/**
 * Pure in-memory database for Vercel serverless.
 * No external dependencies (no sql.js). Ephemeral per cold start.
 * Uses simple arrays and ID counters. Good enough for demo/MVP.
 */

interface Table {
  rows: any[];
  autoId: number;
}

interface Store {
  [tableName: string]: Table;
}

let store: Store | null = null;

function initStore(): Store {
  const s: Store = {
    users: { rows: [], autoId: 1 },
    refresh_tokens: { rows: [], autoId: 1 },
    projects: { rows: [], autoId: 1 },
    project_assignments: { rows: [], autoId: 1 },
    worker_profiles: { rows: [], autoId: 1 },
    certifications: { rows: [], autoId: 1 },
    attendance_records: { rows: [], autoId: 1 },
    expense_categories: { rows: [], autoId: 1 },
    expenses: { rows: [], autoId: 1 },
    documents: { rows: [], autoId: 1 },
    notifications: { rows: [], autoId: 1 },
    subscriptions: { rows: [], autoId: 1 },
  };

  // Seed expense categories
  const cats = [
    { name: 'Materials', icon: 'Package', color: '#3b82f6' },
    { name: 'Equipment', icon: 'Wrench', color: '#8b5cf6' },
    { name: 'Travel', icon: 'Car', color: '#10b981' },
    { name: 'Safety Gear', icon: 'Shield', color: '#f59e0b' },
    { name: 'Subcontractor', icon: 'Users', color: '#ef4444' },
    { name: 'Permits & Fees', icon: 'FileText', color: '#6366f1' },
    { name: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
  ];
  cats.forEach((c) => {
    s.expense_categories.rows.push({ id: s.expense_categories.autoId++, ...c });
  });

  console.log('In-memory store initialized');
  return s;
}

function getStore(): Store {
  if (!store) store = initStore();
  return store;
}

// ─── Simple query helpers that mimic the old WrappedDatabase interface ───

function now(): string {
  return new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
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
