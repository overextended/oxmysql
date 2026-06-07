import { describe, test, expect, beforeEach, spyOn } from 'bun:test';
import { resetNatives, setConvar } from '../../setup';
import { resetDb, setConnectionFactory, createFakeConnection, type FakeConnection } from '../../helpers/db';
import * as config from 'config';

const { createConnectionPool } = await import('database/pool');
await createConnectionPool();
const { rawQuery } = await import('database/rawQuery');

let conn: FakeConnection;

beforeEach(() => {
  resetNatives();
  setConvar('mysql_debug', 'false'); // keep the profiler off for a deterministic call log
  config.setDebug();
  resetDb();
  conn = createFakeConnection();
  setConnectionFactory(() => conn);
});

describe('rawQuery', () => {
  test('runs a parameterised query and returns the insert id', async () => {
    conn.queue.push({ insertId: 5, affectedRows: 1 });
    const result = await rawQuery('insert', 'res', 'INSERT INTO t (a) VALUES (?)', [1]);
    expect(result).toBe(5);
    expect(conn.calls[0]).toEqual({ op: 'query', arg: { sql: 'INSERT INTO t (a) VALUES (?)', values: [1] } });
  });

  test('single resolves the first row through the callback', async () => {
    conn.queue.push([{ a: 1 }, { a: 2 }]);
    let received: unknown;
    await rawQuery('single', 'res', 'SELECT * FROM t WHERE id = ?', [1], (r) => (received = r));
    expect(received).toEqual({ a: 1 });
  });

  test('scalar returns the first column of the first row', async () => {
    conn.queue.push([{ name: 'bob' }]);
    const result = await rawQuery('scalar', 'res', 'SELECT name FROM t WHERE id = ?', [1]);
    expect(result).toBe('bob');
  });

  test('throws-to-callback on a query error (promise form passes the message)', async () => {
    conn.failOn.query = new Error('boom');
    const args: any[] = [];
    await rawQuery('insert', 'res', 'INSERT INTO t VALUES (?)', [1], (...a) => args.push(a), true);
    expect(args[0][0]).toBeNull();
    expect(String(args[0][1])).toContain('boom');
  });

  test('rejects an argument-count mismatch before touching the connection', async () => {
    const args: any[] = [];
    await rawQuery('insert', 'res', 'INSERT INTO t VALUES (?)', [1, 2], (...a) => args.push(a), true);
    expect(String(args[0][1])).toContain('Expected 1 parameters, but received 2');
    expect(conn.calls).toHaveLength(0); // never reached the DB
  });

  test('with debug on, profiles the query via INFORMATION_SCHEMA.PROFILING', async () => {
    setConvar('mysql_debug', 'true');
    config.setDebug();
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    await rawQuery('insert', 'res', 'INSERT INTO t (a) VALUES (?)', [1]);
    expect(conn.calls.some((c) => c.op === 'query' && String(c.arg.sql).includes('PROFILING'))).toBe(true);
    logSpy.mockRestore();
  });

  test('a callback throwing a SCRIPT ERROR string is swallowed', async () => {
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    await rawQuery('insert', 'res', 'INSERT INTO t VALUES (?)', [1], () => {
      throw 'SCRIPT ERROR: boom';
    });
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
