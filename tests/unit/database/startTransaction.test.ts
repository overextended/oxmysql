import { describe, test, expect, beforeEach, spyOn } from 'bun:test';
import { resetNatives, setConvar } from '../../setup';
import { resetDb, setConnectionFactory, createFakeConnection, type FakeConnection } from '../../helpers/db';
import * as config from 'config';

const { createConnectionPool } = await import('database/pool');
await createConnectionPool();
const { startTransaction } = await import('database/startTransaction');

let conn: FakeConnection;

beforeEach(() => {
  resetNatives();
  setConvar('mysql_debug', 'false');
  config.setDebug();
  resetDb();
  conn = createFakeConnection();
  setConnectionFactory(() => conn);
});

describe('startTransaction', () => {
  test('commits when the callback returns true (commit awaited before release)', async () => {
    const result = await startTransaction('res', async (query: any) => {
      await query('INSERT INTO t (a) VALUES (?)', [1]);
      return true;
    });
    expect(result).toBe(true);
    expect(conn.ops()).toEqual(['begin', 'query', 'commit', 'release']);
  });

  test('rolls back (no commit) when the callback returns false', async () => {
    const result = await startTransaction('res', async () => false);
    expect(result).toBe(false);
    expect(conn.ops()).toContain('rollback');
    expect(conn.ops()).not.toContain('commit');
  });

  test('does NOT report success when the commit itself fails', async () => {
    spyOn(console, 'error').mockImplementation(() => {});
    conn.failOn.commit = new Error('commit failed');

    const result = await startTransaction('res', async (query: any) => {
      await query('INSERT INTO t (a) VALUES (?)', [1]);
      return true;
    });

    expect(result).toBe(false);
    expect(conn.ops()).toContain('rollback');
  });

  test('rolls back when a query inside the callback throws', async () => {
    spyOn(console, 'error').mockImplementation(() => {});
    conn.failOn.query = new Error('query failed');

    const result = await startTransaction('res', async (query: any) => {
      await query('INSERT INTO t (a) VALUES (?)', [1]);
      return true;
    });

    expect(result).toBe(false);
    expect(conn.ops()).toContain('rollback');
  });

  test('settles to false when the rollback itself fails', async () => {
    spyOn(console, 'error').mockImplementation(() => {});
    conn.failOn.commit = new Error('commit failed');
    conn.failOn.rollback = new Error('rollback failed');
    const result = await startTransaction('res', async (query: any) => {
      await query('INSERT INTO t (a) VALUES (?)', [1]);
      return true;
    });
    expect(result).toBe(false);
  });

  test('clears the 30s timeout timer (no leaked timer per transaction)', async () => {
    const clearSpy = spyOn(globalThis, 'clearTimeout');
    await startTransaction('res', async () => true);
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
