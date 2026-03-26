import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const ICONS_DIR = path.join(DATA_DIR, 'icons');
const DB_PATH = path.join(DATA_DIR, 'linky.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

let db: SqlJsDatabase;

async function initDb(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#e0e7ff',
      collapsed INTEGER NOT NULL DEFAULT 0,
      grid_x INTEGER NOT NULL DEFAULT 0,
      grid_y INTEGER NOT NULL DEFAULT 0,
      grid_w INTEGER NOT NULL DEFAULT 4,
      grid_h INTEGER NOT NULL DEFAULT 4,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shortcuts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      icon_type TEXT NOT NULL DEFAULT 'favicon',
      icon_path TEXT,
      favicon_cached INTEGER NOT NULL DEFAULT 0,
      grid_x INTEGER NOT NULL DEFAULT 0,
      grid_y INTEGER NOT NULL DEFAULT 0,
      group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default settings
  const existing = db.exec("SELECT key FROM settings WHERE key = 'bg_color'");
  if (existing.length === 0 || existing[0].values.length === 0) {
    db.run("INSERT INTO settings (key, value) VALUES ('bg_color', '#f0f2f5')");
  }
  const layoutExists = db.exec("SELECT key FROM settings WHERE key = 'layout_mode'");
  if (layoutExists.length === 0 || layoutExists[0].values.length === 0) {
    db.run("INSERT INTO settings (key, value) VALUES ('layout_mode', 'row')");
  }
  const defaults: [string, string][] = [
    ['show_title', 'true'],
    ['show_topbar', 'true'],
    ['column_extra_width', '0'],
    ['group_color', '#e0e7ff'],
    ['link_target', '_blank'],
  ];
  for (const [key, value] of defaults) {
    const stmt = db.prepare("SELECT key FROM settings WHERE key = ?");
    stmt.bind([key]);
    const hasRow = stmt.step();
    stmt.free();
    if (!hasRow) {
      db.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
    }
  }
  saveDb();

  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function getDb(): SqlJsDatabase {
  return db;
}

// Helper: run query and return all rows as objects
function queryAll(sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper: run query and return first row as object
function queryOne(sql: string, params: any[] = []): any | null {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper: run statement (INSERT/UPDATE/DELETE)
function runSql(sql: string, params: any[] = []): void {
  db.run(sql, params);
  saveDb();
}

// Run INSERT and return the new row id (captures rowid before saveDb)
function runInsert(sql: string, params: any[] = []): number {
  db.run(sql, params);
  const result = db.exec("SELECT last_insert_rowid() as id");
  const id = result[0].values[0][0] as number;
  saveDb();
  return id;
}

// Get last inserted row id
function lastInsertId(): number {
  const result = db.exec("SELECT last_insert_rowid() as id");
  return result[0].values[0][0] as number;
}

export { initDb, getDb, saveDb, queryAll, queryOne, runSql, runInsert, lastInsertId, ICONS_DIR, DATA_DIR };
