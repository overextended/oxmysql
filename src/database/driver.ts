import { Pool as NativePool, type PoolClient, type PoolConfig as NativePoolConfig, type QueryResult } from 'pg';

export type PoolConfig = NativePoolConfig;
export type RowDataPacket = Record<string, any>;
export type DriverResult = RowDataPacket[] | Record<string, unknown>;

export function readInsertId(rows: RowDataPacket[]) {
  const row = rows[0];
  if (!row) return null;
  const preferred = Object.entries(row).find(([key, value]) => /^(id|.*_id)$/i.test(key) && value !== null);
  const candidate = preferred?.[1] ?? Object.values(row).find((value) => typeof value === 'number');

  if (typeof candidate === 'string' && /^\d+$/.test(candidate)) {
    const numeric = Number(candidate);
    return Number.isSafeInteger(numeric) ? numeric : candidate;
  }

  return typeof candidate === 'number' ? candidate : null;
}

export function normalizeResult(result: QueryResult): DriverResult {
  const command = result.command.toUpperCase();
  const rows = result.rows as RowDataPacket[];

  if (['SELECT', 'SHOW', 'VALUES', 'EXPLAIN', 'FETCH'].includes(command)) return rows;

  return {
    affectedRows: result.rowCount ?? 0,
    changedRows: result.rowCount ?? 0,
    insertId: command === 'INSERT' ? readInsertId(rows) : null,
    command,
    rowCount: result.rowCount,
  };
}

/** Counts positional bindings while ignoring quoted literals, identifiers and SQL comments. */
export function countPlaceholders(sql: string) {
  const backtick = String.fromCharCode(96);
  let count = 0;
  let index = 0;
  let quote: string | null = null;
  let lineComment = false;
  let blockComment = false;
  let dollarTag: string | null = null;

  while (index < sql.length) {
    const char = sql[index];
    const next = sql[index + 1];

    if (dollarTag) {
      if (sql.startsWith(dollarTag, index)) {
        index += dollarTag.length;
        dollarTag = null;
      } else index++;
      continue;
    }

    if (lineComment) {
      if (char === '\n') lineComment = false;
      index++;
      continue;
    }

    if (blockComment) {
      if (char === '*' && next === '/') {
        index += 2;
        blockComment = false;
      } else index++;
      continue;
    }

    if (quote) {
      if (quote === 'backtick') {
        if (char === backtick && next === backtick) index += 2;
        else if (char === backtick) { quote = null; index++; }
        else if (char === '\\' && next) index += 2;
        else index++;
      } else if (char === '\\' && next && quote === "'") index += 2;
      else if (char === quote && next === quote) index += 2;
      else if (char === quote) { quote = null; index++; }
      else index++;
      continue;
    }

    if (char === '-' && next === '-') { lineComment = true; index += 2; continue; }
    if (char === '/' && next === '*') { blockComment = true; index += 2; continue; }

    if (char === '$') {
      const match = sql.slice(index).match(/^\$[A-Za-z_][A-Za-z_0-9]*\$|^\$\$/);
      if (match) { dollarTag = match[0]; index += dollarTag.length; continue; }
    }

    if (char === "'" || char === '"') { quote = char; index++; continue; }
    if (char === backtick) { quote = 'backtick'; index++; continue; }

    if (char === '?') {
      count++;
      index += next === '?' ? 2 : 1;
      continue;
    }

    index++;
  }

  return count;
}

/** Converts common oxmysql placeholders, identifier quotes and INSERT IGNORE syntax. */
export function translateSql(input: string, values: unknown[] = []) {
  if (/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i.test(input)) {
    throw new Error('PostgreSQL does not support MySQL ON DUPLICATE KEY UPDATE. Rewrite with ON CONFLICT (...) DO UPDATE SET.');
  }

  const backtick = String.fromCharCode(96);
  const ignoreConflict = /^\s*INSERT\s+IGNORE\b/i.test(input);
  const sql = input.replace(/^(\s*)INSERT\s+IGNORE\b/i, '$1INSERT');
  let output = '';
  let index = 0;
  let parameterIndex = 0;
  let quote: string | null = null;
  let lineComment = false;
  let blockComment = false;
  let dollarTag: string | null = null;

  while (index < sql.length) {
    const char = sql[index];
    const next = sql[index + 1];

    if (dollarTag) {
      if (sql.startsWith(dollarTag, index)) {
        output += dollarTag;
        index += dollarTag.length;
        dollarTag = null;
      } else {
        output += char;
        index++;
      }
      continue;
    }

    if (lineComment) {
      output += char;
      index++;
      if (char === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      output += char;
      index++;
      if (char === '*' && next === '/') {
        output += '/';
        index++;
        blockComment = false;
      }
      continue;
    }

    if (quote) {
      if (quote === 'backtick') {
        if (char === backtick && next === backtick) {
          output += '""';
          index += 2;
          continue;
        }
        if (char === backtick) {
          output += '"';
          quote = null;
          index++;
          continue;
        }
        if (char === '\\' && next) {
          output += next === '"' ? '""' : next;
          index += 2;
          continue;
        }
        output += char;
        index++;
        continue;
      }

      output += char;
      index++;
      if (char === '\\' && next && quote === "'") {
        output += next;
        index++;
      } else if (char === quote) {
        if (next === quote) {
          output += next;
          index++;
        } else quote = null;
      }
      continue;
    }

    if (char === '-' && next === '-') {
      output += '--';
      index += 2;
      lineComment = true;
      continue;
    }

    if (char === '/' && next === '*') {
      output += '/*';
      index += 2;
      blockComment = true;
      continue;
    }

    if (char === '$') {
      const match = sql.slice(index).match(/^\$[A-Za-z_][A-Za-z_0-9]*\$|^\$\$/);
      if (match) {
        dollarTag = match[0];
        output += dollarTag;
        index += dollarTag.length;
        continue;
      }
    }

    if (char === "'" || char === '"') {
      quote = char;
      output += char;
      index++;
      continue;
    }

    if (char === backtick) {
      quote = 'backtick';
      output += '"';
      index++;
      continue;
    }

    if (char === '?') {
      if (next === '?') {
        throw new Error('MySQL identifier placeholders are not supported. Quote the identifier explicitly.');
      }
      parameterIndex++;
      output += '$' + parameterIndex;
      index++;
      continue;
    }

    output += char;
    index++;
  }

  if (parameterIndex !== values.length) {
    throw new Error('PostgreSQL placeholder count mismatch: SQL contains ' + parameterIndex + ' placeholders but received ' + values.length + ' values.');
  }

  if (ignoreConflict && !/\bON\s+CONFLICT\b/i.test(output)) {
    const semicolon = /;\s*$/.test(output);
    output = output.replace(/;\s*$/, '') + ' ON CONFLICT DO NOTHING' + (semicolon ? ';' : '');
  }

  if (/^\s*INSERT\b/i.test(output) && !/\bRETURNING\b/i.test(output)) {
    const semicolon = /;\s*$/.test(output);
    output = output.replace(/;\s*$/, '') + ' RETURNING *' + (semicolon ? ';' : '');
  }

  return { sql: output, values };
}

class PgConnection {
  readonly connection: { threadId: number };

  constructor(private readonly client: PoolClient) {
    this.connection = { threadId: client.processID ?? 0 };
  }

  async query(sql: string, values: unknown[] = []): Promise<[DriverResult, unknown[]]> {
    const translated = translateSql(sql, values);
    const result = await this.client.query(translated.sql, translated.values);
    return [normalizeResult(result), result.fields];
  }

  async execute(options: { sql: string; values?: unknown[] }): Promise<[DriverResult, unknown[]]> {
    return this.query(options.sql, options.values ?? []);
  }

  async beginTransaction() { await this.client.query('BEGIN'); }
  async rollback() { await this.client.query('ROLLBACK'); }
  async commit() { await this.client.query('COMMIT'); }
  release() { this.client.release(); }
}

export type Connection = PgConnection;
export type PoolConnection = PgConnection;

export class Pool {
  private readonly native: NativePool;

  constructor(config: PoolConfig) {
    this.native = new NativePool(config);
  }

  on(event: 'connection', listener: (connection: PgConnection) => void) {
    this.native.on('connect', (client) => listener(new PgConnection(client)));
    return this;
  }

  async query(sql: string, values: unknown[] = []): Promise<[DriverResult, unknown[]]> {
    const translated = translateSql(sql, values);
    const result = await this.native.query(translated.sql, translated.values);
    return [normalizeResult(result), result.fields];
  }

  async getConnection(): Promise<PgConnection> {
    return new PgConnection(await this.native.connect());
  }

  async end() {
    await this.native.end();
  }
}

export function createPool(config: PoolConfig) {
  return new Pool(config);
}
