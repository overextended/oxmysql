import { describe, test, expect, beforeEach, spyOn } from 'bun:test';
import { resetNatives, setConvar } from '../../setup';
import { resetDb, setConnectionFactory, createFakeConnection, type FakeConnection } from '../../helpers/db';
import * as config from 'config';

const { createConnectionPool } = await import('database/pool');
await createConnectionPool();
const { rawExecute } = await import('database/rawExecute');

let conn: FakeConnection;

beforeEach(() => {
  resetNatives();
  setConvar('mysql_debug', 'false');
  config.setDebug();
  resetDb();
  conn = createFakeConnection();
  setConnectionFactory(() => conn);
});

describe('rawExecute', () => {
  test('executes once per parameter set in a batch', async () => {
    conn.queue.push({ affectedRows: 1, insertId: 1 }, { affectedRows: 1, insertId: 2 });
    await rawExecute('res', 'INSERT INTO t (a) VALUES (?)', [[1], [2]]);

    const executes = conn.calls.filter((c) => c.op === 'execute');
    expect(executes).toHaveLength(2);
    expect(executes[0].arg.sql).toBe('INSERT INTO t (a) VALUES (?)');
  });

  test('pads a short value row with null up to the placeholder count', async () => {
    await rawExecute('res', 'INSERT INTO t (a, b) VALUES (?, ?)', [[1]]);
    const exec = conn.calls.find((c) => c.op === 'execute');
    expect(exec!.arg.values).toEqual([1, null]);
  });

  test('prepare (unpack) returns a single scalar for a one-column row', async () => {
    // The scalar/row unwrap happens in the callback branch (how `prepare` runs).
    conn.queue.push([{ id: 7 }]);
    let received: unknown;
    await rawExecute('res', 'SELECT id FROM t WHERE a = ?', [[1]], (r) => (received = r), true, true);
    expect(received).toBe(7);
  });

  test('surfaces an execute error through the callback', async () => {
    conn.failOn.execute = new Error('exec failed');
    const args: any[] = [];
    await rawExecute('res', 'INSERT INTO t VALUES (?)', [[1]], (...a) => args.push(a), true);
    expect(String(args[0][1])).toContain('exec failed');
  });

  test('reports a parse error before reaching the connection', async () => {
    const args: any[] = [];
    await rawExecute('res', 123 as any, [[1]], (...a) => args.push(a), true);
    expect(String(args[0][1])).toContain('Expected query to be a string');
    expect(conn.calls).toHaveLength(0);
  });

  test('spreads a multi-result-set response into separate entries', async () => {
    conn.queue.push([{ a: 1 }, { b: 2 }]);
    const result = await rawExecute('res', 'SELECT a; SELECT b', [[1]]);
    expect(result).toEqual([{ a: 1 }, { b: 2 }]);
  });

  test('prepare (unpack) returns a whole row when it has multiple columns', async () => {
    conn.queue.push([{ id: 7, name: 'x' }]);
    let received: unknown;
    await rawExecute('res', 'SELECT id, name FROM t WHERE a = ?', [[1]], (r) => (received = r), true, true);
    expect(received).toEqual({ id: 7, name: 'x' });
  });

  test('a callback that throws a SCRIPT ERROR string is swallowed', async () => {
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    await rawExecute(
      'res',
      'INSERT INTO t VALUES (?)',
      [[1]],
      () => {
        throw 'SCRIPT ERROR: boom';
      },
      true
    );
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
