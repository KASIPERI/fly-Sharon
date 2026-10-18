/**
 * Browser-compatible SQLite Driver & Storage Engine
 * Provides persistent SQLite-like relational table storage, index handling,
 * and parameterized query execution for Web & offline environments.
 */

import { IDatabaseDriver } from '../types';

interface TableRow {
  [column: string]: unknown;
}

interface TableDef {
  columns: string[];
  rows: TableRow[];
  autoIncrementId: number;
}

export class BrowserSqliteDriver implements IDatabaseDriver {
  private tables: Map<string, TableDef> = new Map();
  private storageKey = 'skyguard_sqlite_v1';
  private isLoaded = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const [tName, tDef] of Object.entries(parsed)) {
          this.tables.set(tName, tDef as TableDef);
        }
        this.isLoaded = true;
      }
    } catch {
      // Fallback to in-memory state
    }
  }

  public saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      const obj: Record<string, TableDef> = {};
      for (const [key, value] of this.tables.entries()) {
        obj[key] = value;
      }
      window.localStorage.setItem(this.storageKey, JSON.stringify(obj));
    } catch {
      // Storage quota or serialization catch
    }
  }

  public async exec(sql: string): Promise<void> {
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await this.run(stmt);
    }
  }

  public async run(sql: string, params: unknown[] = []): Promise<{ changes: number; lastInsertRowid: number }> {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    // 1. CREATE TABLE
    if (upper.startsWith('CREATE TABLE')) {
      const match = trimmed.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
      if (match && match[1]) {
        const tableName = match[1];
        if (!this.tables.has(tableName)) {
          this.tables.set(tableName, {
            columns: [],
            rows: [],
            autoIncrementId: 1,
          });
          this.saveToStorage();
        }
      }
      return { changes: 1, lastInsertRowid: 0 };
    }

    // 2. CREATE INDEX
    if (upper.startsWith('CREATE INDEX')) {
      return { changes: 0, lastInsertRowid: 0 };
    }

    // 3. INSERT INTO
    if (upper.startsWith('INSERT INTO')) {
      const match = trimmed.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (match && match[1] && match[2]) {
        const tableName = match[1];
        const cols = match[2].split(',').map((c) => c.trim().toLowerCase());
        
        let table = this.tables.get(tableName);
        if (!table) {
          table = { columns: cols, rows: [], autoIncrementId: 1 };
          this.tables.set(tableName, table);
        }

        const row: TableRow = {};
        cols.forEach((col, idx) => {
          row[col] = params[idx] !== undefined ? params[idx] : null;
        });

        if (!row['id']) {
          row['id'] = table.autoIncrementId++;
        }

        table.rows.push(row);
        this.saveToStorage();
        return { changes: 1, lastInsertRowid: Number(row['id']) || 0 };
      }
    }

    // 4. UPDATE
    if (upper.startsWith('UPDATE')) {
      const match = trimmed.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
      if (match && match[1] && match[2]) {
        const tableName = match[1];
        const setClause = match[2];
        const whereClause = match[3];

        const table = this.tables.get(tableName);
        if (!table) return { changes: 0, lastInsertRowid: 0 };

        // Parse setters
        const setPairs = setClause.split(',').map((s) => s.trim());
        let changes = 0;

        for (const row of table.rows) {
          let matchesWhere = true;
          if (whereClause) {
            const idMatch = whereClause.match(/id\s*=\s*\?/i);
            if (idMatch && params.length > 0) {
              const targetId = params[params.length - 1];
              matchesWhere = String(row['id']) === String(targetId);
            }
          }

          if (matchesWhere) {
            setPairs.forEach((pair, idx) => {
              const [col] = pair.split('=').map((c) => c.trim().toLowerCase());
              if (col && params[idx] !== undefined) {
                row[col] = params[idx];
              }
            });
            changes++;
          }
        }

        this.saveToStorage();
        return { changes, lastInsertRowid: 0 };
      }
    }

    // 5. DELETE
    if (upper.startsWith('DELETE FROM')) {
      const match = trimmed.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?$/i);
      if (match && match[1]) {
        const tableName = match[1];
        const table = this.tables.get(tableName);
        if (!table) return { changes: 0, lastInsertRowid: 0 };

        const initialLength = table.rows.length;
        if (!match[2]) {
          table.rows = [];
        } else if (params.length > 0) {
          const targetId = params[0];
          table.rows = table.rows.filter((r) => String(r['id']) !== String(targetId));
        }

        this.saveToStorage();
        return { changes: initialLength - table.rows.length, lastInsertRowid: 0 };
      }
    }

    return { changes: 0, lastInsertRowid: 0 };
  }

  public async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    if (!upper.startsWith('SELECT')) {
      return [];
    }

    const fromMatch = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (!fromMatch || !fromMatch[1]) {
      return [];
    }

    const tableName = fromMatch[1];
    const table = this.tables.get(tableName);
    if (!table) {
      return [];
    }

    let rows = [...table.rows];

    // Filter by WHERE (parameterized or literal)
    const whereMatch = trimmed.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
    if (whereMatch && whereMatch[1]) {
      const whereCondition = whereMatch[1].trim();
      if (params.length > 0) {
        if (whereCondition.includes('unit_id = ?') || whereCondition.includes('unit_id=?')) {
          rows = rows.filter((r) => String(r['unit_id']) === String(params[0]));
        } else if (whereCondition.includes('id = ?') || whereCondition.includes('id=?')) {
          rows = rows.filter((r) => String(r['id']) === String(params[0]));
        }
      } else {
        // Handle literal equality, e.g. id = 'DRONE-SKY-01' or status = 'active'
        const literalMatch = whereCondition.match(/([a-zA-Z0-9_]+)\s*=\s*['"]?([^'"]+)['"]?/i);
        if (literalMatch && literalMatch[1] && literalMatch[2]) {
          const colName = literalMatch[1].toLowerCase();
          const targetVal = literalMatch[2].trim();
          rows = rows.filter((r) => String(r[colName] ?? '').toLowerCase() === targetVal.toLowerCase());
        }
      }
    }

    // ORDER BY timestamp DESC
    if (upper.includes('ORDER BY TIMESTAMP DESC')) {
      rows.sort((a, b) => {
        const timeA = new Date(String(a['timestamp'] || 0)).getTime();
        const timeB = new Date(String(b['timestamp'] || 0)).getTime();
        return timeB - timeA;
      });
    }

    // LIMIT
    const limitMatch = trimmed.match(/LIMIT\s+(\d+|\?)/i);
    if (limitMatch && limitMatch[1]) {
      let limit = parseInt(limitMatch[1], 10);
      if (isNaN(limit) && params.length > 1) {
        limit = Number(params[params.length - 1]);
      }
      if (!isNaN(limit)) {
        rows = rows.slice(0, limit);
      }
    }

    return rows as unknown as T[];
  }

  public async exportDb(): Promise<string> {
    const dump: Record<string, unknown> = {};
    for (const [k, v] of this.tables.entries()) {
      dump[k] = v;
    }
    return JSON.stringify(dump, null, 2);
  }

  public isInitialized(): boolean {
    return this.tables.size > 0 && this.isLoaded;
  }
}
