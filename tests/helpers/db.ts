import { mock } from 'bun:test';

// Fake mysql2 PoolConnection that records the op sequence and returns scriptable results.
export type Op = 'query' | 'execute' | 'begin' | 'commit' | 'rollback' | 'release';

export interface FakeConnection {
  connection: { threadId: number };
  calls: { op: Op; arg?: any }[];
  queue: any[];
  failOn: Partial<Record<Op, unknown>>;
  query: (sql: any, values?: any) => Promise<[any, any]>;
  execute: (opts: any) => Promise<[any, any]>;
  beginTransaction: () => Promise<void>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  release: () => void;
  ops: () => Op[];
}

let threadSeq = 0;
export function createFakeConnection(threadId = ++threadSeq + 1000): FakeConnection {
  const calls: { op: Op; arg?: any }[] = [];
  const nextResult = (c: FakeConnection) => (c.queue.length ? c.queue.shift() : { affectedRows: 1, insertId: 1 });

  const conn: FakeConnection = {
    connection: { threadId },
    calls,
    queue: [],
    failOn: {},
    async query(sql, values) {
      calls.push({ op: 'query', arg: { sql, values } });
      if (conn.failOn.query) throw conn.failOn.query;
      return [nextResult(conn), []];
    },
    async execute(opts) {
      calls.push({ op: 'execute', arg: opts });
      if (conn.failOn.execute) throw conn.failOn.execute;
      return [nextResult(conn), []];
    },
    async beginTransaction() {
      calls.push({ op: 'begin' });
      if (conn.failOn.begin) throw conn.failOn.begin;
    },
    async commit() {
      calls.push({ op: 'commit' });
      // yield a microtask so a missing await is observable
      await Promise.resolve();
      if (conn.failOn.commit) throw conn.failOn.commit;
    },
    async rollback() {
      calls.push({ op: 'rollback' });
      if (conn.failOn.rollback) throw conn.failOn.rollback;
    },
    release() {
      calls.push({ op: 'release' });
    },
    ops: () => calls.map((c) => c.op),
  };

  return conn;
}

let issued: FakeConnection[] = [];
let factory: () => FakeConnection = () => createFakeConnection();
let poolCreationError: unknown = null;
let connectionHandler: ((conn: any) => void) | null = null;

export function setConnectionFactory(fn: () => FakeConnection) {
  factory = fn;
}
export function issuedConnections() {
  return issued;
}
export function lastConnection() {
  return issued[issued.length - 1];
}
export function setPoolCreationError(err: unknown) {
  poolCreationError = err;
}
export function getConnectionHandler() {
  return connectionHandler;
}
export function resetDb() {
  issued = [];
  factory = () => createFakeConnection();
  poolCreationError = null;
}

export const fakePool = {
  on: (event: string, handler: (conn: any) => void) => {
    if (event === 'connection') connectionHandler = handler;
  },
  async query() {
    return [[{ version: '8.0.0-test' }]];
  },
  async getConnection() {
    const c = factory();
    issued.push(c);
    return c;
  },
  async end() {},
};

mock.module('mysql2/promise', () => ({
  createPool: () => {
    if (poolCreationError) throw poolCreationError;
    return fakePool;
  },
}));
