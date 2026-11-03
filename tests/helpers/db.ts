import { mock } from 'bun:test';

export type Op = 'query' | 'execute' | 'begin' | 'commit' | 'rollback' | 'release';

export interface FakeConnection {
  processID: number;
  connection: { threadId: number };
  calls: { op: Op; arg?: any }[];
  queue: any[];
  failOn: Partial<Record<Op, unknown>>;
  query: (sql: string, values?: any[]) => Promise<any>;
  release: () => void;
  ops: () => Op[];
}

let threadSeq = 0;
export function createFakeConnection(threadId = ++threadSeq + 1000): FakeConnection {
  const calls: { op: Op; arg?: any }[] = [];
  const nextResult = (sql: string, c: FakeConnection) => {
    const statement = sql.trim();
    const command = (statement.match(/^(?:\/\*.*?\*\/\s*)?([a-z]+)/i)?.[1] ?? 'SELECT').toUpperCase();
    if (/^SET SESSION CHARACTERISTICS/i.test(statement)) {
      return { rows: [], rowCount: 0, command: 'SET', fields: [] };
    }
    const queued = c.queue.length ? c.queue.shift() : undefined;
    if (queued && typeof queued === 'object' && 'rows' in queued && 'command' in queued) return queued;
    if (Array.isArray(queued)) return { rows: queued, rowCount: queued.length, command, fields: [] };
    if (queued && typeof queued === 'object' && 'insertId' in queued) {
      return { rows: queued.insertId == null ? [] : [{ id: queued.insertId }], rowCount: queued.affectedRows ?? 1, command, fields: [] };
    }
    if (queued && typeof queued === 'object' && 'affectedRows' in queued) {
      return { rows: [], rowCount: queued.affectedRows, command, fields: [] };
    }
    if (sql.toLowerCase().includes('select version()')) {
      return { rows: [{ version: 'PostgreSQL 17.0-test' }], rowCount: 1, command: 'SELECT', fields: [] };
    }
    if (command === 'INSERT') return { rows: [{ id: 1 }], rowCount: 1, command, fields: [] };
    if (command === 'SELECT') return { rows: [], rowCount: 0, command, fields: [] };
    return { rows: [], rowCount: 1, command, fields: [] };
  };

  const conn: FakeConnection = {
    processID: threadId,
    connection: { threadId },
    calls,
    queue: [],
    failOn: {},
    async query(sql, values = []) {
      const statement = sql.trim().toUpperCase();
      if (statement === 'BEGIN') {
        calls.push({ op: 'begin' });
        if (conn.failOn.begin) throw conn.failOn.begin;
      } else if (statement === 'COMMIT') {
        calls.push({ op: 'commit' });
        if (conn.failOn.commit) throw conn.failOn.commit;
      } else if (statement === 'ROLLBACK') {
        calls.push({ op: 'rollback' });
        if (conn.failOn.rollback) throw conn.failOn.rollback;
      } else {
        calls.push({ op: 'query', arg: { sql, values } });
      }
      if (/^SET\s+profiling/i.test(statement)) throw new Error('syntax error at SET profiling');
      if (!/^SET SESSION CHARACTERISTICS/i.test(statement) && conn.failOn.query) throw conn.failOn.query;
      return nextResult(sql, conn);
    },
    release() { calls.push({ op: 'release' }); },
    ops: () => calls
      .filter((call) => !(call.op === 'query' && /^SET SESSION CHARACTERISTICS/i.test(call.arg?.sql ?? '')))
      .map((call) => call.op),
  };
  return conn;
}

let issued: FakeConnection[] = [];
let factory: () => FakeConnection = () => createFakeConnection();
let poolCreationError: unknown = null;
let connectionHandler: ((conn: any) => void) | null = null;

export function setConnectionFactory(fn: () => FakeConnection) { factory = fn; }
export function issuedConnections() { return issued; }
export function lastConnection() { return issued[issued.length - 1]; }
export function setPoolCreationError(err: unknown) { poolCreationError = err; }
export function getConnectionHandler() { return connectionHandler; }
export function resetDb() {
  issued = [];
  factory = () => createFakeConnection();
  poolCreationError = null;
}

class FakePool {
  constructor() { if (poolCreationError) throw poolCreationError; }
  on(event: string, handler: (conn: any) => void) {
    if (event === 'connect') connectionHandler = handler;
    return this;
  }
  async query(sql: string, values?: any[]) {
    const connection = await this.connect();
    try { return await connection.query(sql, values); }
    finally { connection.release(); }
  }
  async connect() {
    const connection = factory();
    issued.push(connection);
    connectionHandler?.(connection);
    return connection;
  }
  async end() {}
}

mock.module('pg', () => ({ Pool: FakePool }));
