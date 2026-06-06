import { describe, test, expect, beforeEach, spyOn } from 'bun:test';
import { resetNatives, setConvar } from '../setup';
import * as config from 'config';
import { runProfiler, profileBatchStatements } from 'profiler';

function fakeConn(rows: any[] = []) {
  const queries: string[] = [];
  return {
    queries,
    query: async (sql: string) => {
      queries.push(sql);
      return rows.length ? (rows as any) : ([] as any);
    },
  };
}

beforeEach(() => resetNatives());

describe('runProfiler', () => {
  test('is a no-op when debug is disabled', async () => {
    setConvar('mysql_debug', 'false');
    config.setDebug();
    const conn = fakeConn();
    expect(await runProfiler(conn as any, 'res')).toBeUndefined();
    expect(conn.queries).toHaveLength(0);
  });

  test('runs the four profiling statements and returns true when debug is on', async () => {
    setConvar('mysql_debug', 'true');
    config.setDebug();
    const conn = fakeConn();
    expect(await runProfiler(conn as any, 'res')).toBe(true);
    expect(conn.queries).toEqual([
      'SET profiling_history_size = 0',
      'SET profiling = 0',
      'SET profiling_history_size = 100',
      'SET profiling = 1',
    ]);
  });

  test('skips resources not in the debug allow-list', async () => {
    setConvar('mysql_debug', '["other-resource"]');
    config.setDebug();
    const conn = fakeConn();
    expect(await runProfiler(conn as any, 'res')).toBeUndefined();
    expect(conn.queries).toHaveLength(0);
  });
});

describe('profileBatchStatements', () => {
  test('logs the per-statement duration for a string query batch', async () => {
    setConvar('mysql_debug', 'true');
    config.setDebug();
    const log = spyOn(console, 'log').mockImplementation(() => {});
    const conn = fakeConn([{ duration: '2.5000' }]);

    await profileBatchStatements(conn as any, 'res', 'INSERT INTO t VALUES (?)', [[1]], 0);

    expect(log).toHaveBeenCalled();
    expect(log.mock.calls.some((c) => String(c[0]).includes('2.5000'))).toBe(true);
    log.mockRestore();
  });

  test('logs durations for a transaction (object[]) batch', async () => {
    setConvar('mysql_debug', 'true');
    config.setDebug();
    const log = spyOn(console, 'log').mockImplementation(() => {});
    const conn = fakeConn([{ duration: '3.1000' }]);

    await profileBatchStatements(conn as any, 'res', [{ query: 'UPDATE t SET a = ?', params: [1] }], null, 0);

    expect(log.mock.calls.some((c) => String(c[0]).includes('UPDATE t SET a = ?'))).toBe(true);
    log.mockRestore();
  });

  test('returns early when profiling produced no rows', async () => {
    setConvar('mysql_debug', 'true');
    config.setDebug();
    const conn = fakeConn([]); // profiling query returns no rows
    await profileBatchStatements(conn as any, 'res', 'INSERT INTO t VALUES (?)', [[1]], 0);
  });
});
