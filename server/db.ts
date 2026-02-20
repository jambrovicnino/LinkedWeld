import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'weldforce.db');

let db: WrappedDatabase;

interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

interface PreparedStatement {
  get(...params: any[]): any;
  all(...params: any[]): any[];
  run(...params: any[]): RunResult;
}

export interface WrappedDatabase {
  prepare(sql: string): PreparedStatement;
  exec(sql: string): void;
  close(): void;
}

function wrapDatabase(sqlDb: SqlJsDatabase, dbPath: string): WrappedDatabase {
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        const data = sqlDb.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
      } catch (e) {
        console.error('Failed to save database:', e);
      }
    }, 100);
  }

  return {
    prepare(sql: string): PreparedStatement {
      return {
        get(...params: any[]): any {
          try {
            const stmt = sqlDb.prepare(sql);
            if (params.length > 0) stmt.bind(params);
            if (stmt.step()) {
              const cols = stmt.getColumnNames();
              const vals = stmt.get();
              const row: any = {};
              for (let i = 0; i < cols.length; i++) {
                row[cols[i]] = vals[i];
              }
              stmt.free();
              return row;
            }
            stmt.free();
            return undefined;
          } catch (e) {
            console.error('SQL error in get():', sql, params, e);
            return undefined;
          }
        },
        all(...params: any[]): any[] {
          try {
            const stmt = sqlDb.prepare(sql);
            if (params.length > 0) stmt.bind(params);
            const results: any[] = [];
            while (stmt.step()) {
              const cols = stmt.getColumnNames();
              const vals = stmt.get();
              const row: any = {};
              for (let i = 0; i < cols.length; i++) {
                row[cols[i]] = vals[i];
              }
              results.push(row);
            }
            stmt.free();
            return results;
          } catch (e) {
            console.error('SQL error in all():', sql, params, e);
            return [];
          }
        },
        run(...params: any[]): RunResult {
          try {
            sqlDb.run(sql, params);
            scheduleSave();
            const lastId = sqlDb.exec('SELECT last_insert_rowid() as id');
            const changes = sqlDb.getRowsModified();
            return {
              changes,
              lastInsertRowid: lastId.length > 0 && lastId[0].values.length > 0 ? Number(lastId[0].values[0][0]) : 0
            };
          } catch (e) {
            console.error('SQL error in run():', sql, params, e);
            return { changes: 0, lastInsertRowid: 0 };
          }
        }
      };
    },
    exec(sql: string): void {
      sqlDb.run(sql);
      scheduleSave();
    },
    close(): void {
      if (saveTimer) clearTimeout(saveTimer);
      const data = sqlDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
      sqlDb.close();
    }
  };
}

export function getDb(): WrappedDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs();

  let sqlDb: SqlJsDatabase;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  db = wrapDatabase(sqlDb, DB_PATH);

  db.exec(`PRAGMA foreign_keys = ON`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'welder',
      company_name TEXT,
      phone TEXT,
      avatar_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      subscription_tier TEXT NOT NULL DEFAULT 'free',
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      client_id INTEGER,
      status TEXT NOT NULL DEFAULT 'draft',
      priority TEXT NOT NULL DEFAULT 'medium',
      budget REAL,
      currency TEXT DEFAULT 'EUR',
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      progress INTEGER DEFAULT 0,
      welding_types TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS project_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL DEFAULT 'welder',
      status TEXT NOT NULL DEFAULT 'pending',
      hourly_rate REAL,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS project_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      is_completed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS worker_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      trade TEXT,
      experience_years INTEGER DEFAULT 0,
      hourly_rate REAL,
      skills TEXT,
      bio TEXT,
      availability TEXT DEFAULT 'available',
      location TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      issuing_body TEXT,
      cert_number TEXT,
      issue_date TEXT,
      expiry_date TEXT,
      status TEXT DEFAULT 'active',
      document_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id INTEGER NOT NULL,
      project_id INTEGER,
      check_in TEXT NOT NULL,
      check_out TEXT,
      check_in_lat REAL,
      check_in_lng REAL,
      check_out_lat REAL,
      check_out_lng REAL,
      hours_worked REAL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (worker_id) REFERENCES users(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS expense_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      icon TEXT,
      color TEXT
    )
  `);

  // Seed expense categories
  const catCount = db.prepare('SELECT COUNT(*) as c FROM expense_categories').get() as any;
  if (catCount && catCount.c === 0) {
    db.exec(`
      INSERT INTO expense_categories (name, icon, color) VALUES
      ('Materials', 'Package', '#3b82f6'),
      ('Equipment', 'Wrench', '#8b5cf6'),
      ('Travel', 'Car', '#10b981'),
      ('Safety Gear', 'Shield', '#f59e0b'),
      ('Subcontractor', 'Users', '#ef4444'),
      ('Permits & Fees', 'FileText', '#6366f1'),
      ('Other', 'MoreHorizontal', '#6b7280')
    `);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      project_id INTEGER,
      category_id INTEGER,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'EUR',
      receipt_url TEXT,
      status TEXT DEFAULT 'pending',
      approved_by INTEGER,
      approved_at TEXT,
      expense_date TEXT NOT NULL DEFAULT (datetime('now')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (category_id) REFERENCES expense_categories(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      project_id INTEGER,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      expiry_date TEXT,
      is_shared INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      tier TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      start_date TEXT NOT NULL DEFAULT (datetime('now')),
      end_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_attendance_worker ON attendance_records(worker_id)`);

  console.log('Database initialized successfully');
}
