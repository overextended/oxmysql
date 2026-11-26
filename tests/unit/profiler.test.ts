import { describe, test, expect, beforeEach, afterEach, spyOn, mock } from 'bun:test';
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
afterEach(() => mock.restore());

async function freshProfiler() {
  setConvar('mysql_debug', 'true');
  config.setDebug();
  const modulePath = '../../src/profiler/index.ts';
  delete require.cache[require.resolve(modulePath)];
  return import(modulePath) as Promise<typeof import('profiler')>;
}

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

describe('unsupported profiling fallback', () => {
  test.each([new Error('profiling unsupported'), 'profiling unsupported'])(
    'warns once on the initial failure (%s) and skips subsequent setup',
    async (failure) => {
      const profiler = await freshProfiler();
      const warn = spyOn(console, 'warn').mockImplementation(() => {});
      const conn = fakeConn();
      const query = spyOn(conn, 'query').mockRejectedValue(failure);

      expect(await profiler.runProfiler(conn as any, 'res')).toBe(false);
      expect(await profiler.runProfiler(conn as any, 'res')).toBe(false);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenCalledWith('SET profiling_history_size = 0');
      expect(warn.mock.calls).toEqual([
        [
          '^3Query profiling is unavailable on this database server (profiling unsupported). Falling back to basic query timing.^0',
        ],
      ]);
    },
  );

  test('disables profiling silently if setup fails after previously succeeding', async () => {
    const profiler = await freshProfiler();
    const conn = fakeConn();
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    expect(await profiler.runProfiler(conn as any, 'res')).toBe(true);
    expect(conn.queries).toHaveLength(4);

    const query = spyOn(conn, 'query').mockRejectedValue(new Error('connection lost'));
    expect(await profiler.runProfiler(conn as any, 'res')).toBe(false);
    expect(await profiler.runProfiler(conn as any, 'res')).toBe(false);
    expect(query).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });

  test('explicitly disabling profiling prevents further setup queries', async () => {
    const profiler = await freshProfiler();
    const conn = fakeConn();
    expect(await profiler.runProfiler(conn as any, 'res')).toBe(true);
    profiler.markProfilerUnsupported();
    expect(await profiler.runProfiler(conn as any, 'res')).toBe(false);
    expect(conn.queries).toEqual([
      'SET profiling_history_size = 0',
      'SET profiling = 0',
      'SET profiling_history_size = 100',
      'SET profiling = 1',
    ]);
  });

  test.each(['fetch', 'reset'])('disables profiling when batch %s fails', async (stage) => {
    const profiler = await freshProfiler();
    const conn = fakeConn([{ duration: '1.0000' }]);
    const originalQuery = conn.query;
    const query = spyOn(conn, 'query').mockImplementation(async (sql) => {
      if (stage === 'fetch' || sql === 'SET profiling_history_size = 0') throw new Error('unsupported');
      return originalQuery(sql);
    });
    const log = spyOn(console, 'log').mockImplementation(() => {});

    await profiler.profileBatchStatements(conn as any, 'res', 'SELECT ?', [[1]], 0);
    expect(await profiler.runProfiler(conn as any, 'res')).toBe(false);
    expect(query.mock.calls).toEqual([
      ['SELECT FORMAT(SUM(DURATION) * 1000, 4) AS `duration` FROM INFORMATION_SCHEMA.PROFILING GROUP BY QUERY_ID'],
      ...(stage === 'reset' ? [['SET profiling_history_size = 0'] satisfies [string]] : []),
    ]);
    expect(log).not.toHaveBeenCalled();
  });
});

test('handles concurrent setup outcomes and logs batches with a parameter offset', async () => {
  const profiler = await freshProfiler();
  const conn = fakeConn([{ duration: '2.5000' }]);
  const log = spyOn(console, 'log').mockImplementation(() => {});
  const warn = spyOn(console, 'warn').mockImplementation(() => {});
  const failingConn = fakeConn();
  spyOn(failingConn, 'query').mockRejectedValue(new Error('profiling unavailable'));
  expect(
    await Promise.all([profiler.runProfiler(failingConn as any, 'res'), profiler.runProfiler(conn as any, 'res')]),
  ).toEqual([false, true]);
  expect(warn.mock.calls).toEqual([
    [
      '^3Query profiling is unavailable on this database server (profiling unavailable). Falling back to basic query timing.^0',
    ],
  ]);
  warn.mockClear();
  await profiler.profileBatchStatements(conn as any, 'res', 'INSERT INTO t VALUES (?)', [[0], [1]], 1);
  await profiler.profileBatchStatements(conn as any, 'res', [{ query: 'SELECT 1' }], null, 0);
  expect(log.mock.calls.map(([message]) => message)).toEqual([
    expect.stringContaining('INSERT INTO t VALUES (?) [1]'),
    expect.stringContaining('SELECT 1'),
  ]);

  const query = spyOn(conn, 'query').mockRejectedValue(new Error('profiling unavailable'));
  expect(await profiler.runProfiler(conn as any, 'res')).toBe(false);
  expect(warn).not.toHaveBeenCalled();
  profiler.markProfilerUnsupported();
  expect(await profiler.runProfiler(conn as any, 'res')).toBe(false);
  await profiler.profileBatchStatements(conn as any, 'res', 'SELECT 1', [], 0);
  expect(query).toHaveBeenCalledTimes(2);
});
