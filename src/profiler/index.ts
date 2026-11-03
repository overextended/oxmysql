import { mysql_debug } from 'config';
import type { MySql } from 'database';
import type { CFXParameters } from 'types';

const profilerStatements = [
  'SET profiling_history_size = 0',
  'SET profiling = 0',
  'SET profiling_history_size = 100',
  'SET profiling = 1',
];

let profilerSupported: boolean | undefined;

export function markProfilerUnsupported() {
  profilerSupported = false;
}

export async function runProfiler(connection: MySql, invokingResource: string) {
  if (!mysql_debug) return;
  if (Array.isArray(mysql_debug) && !mysql_debug.includes(invokingResource)) return;
  if (profilerSupported === false) return false;

  try {
    for (const statement of profilerStatements) await connection.query(statement);
    profilerSupported = true;
    return true;
  } catch (err) {
    if (profilerSupported === undefined) {
      console.warn(
        '^3Query profiling is unavailable on this database server (' +
          (err instanceof Error ? err.message : err) +
          '). Falling back to basic query timing.^0',
      );
    }
    profilerSupported = false;
    return false;
  }
}

export async function profileBatchStatements(
  connection: MySql,
  invokingResource: string,
  query: string | { query: string; params?: CFXParameters }[],
  parameters: CFXParameters | null,
  offset: number,
) {
  let profiler: Record<string, any>[];
  try {
    profiler = (await connection.query(
      'SELECT FORMAT(SUM(DURATION) * 1000, 4) AS duration FROM INFORMATION_SCHEMA.PROFILING GROUP BY QUERY_ID',
    )) as Record<string, any>[];
    for (const statement of profilerStatements) await connection.query(statement);
  } catch {
    profilerSupported = false;
    return;
  }

  if (profiler.length === 0) return;
  const { logQuery } = await import('../logger');

  if (typeof query === 'string' && parameters) {
    for (let i = 0; i < profiler.length; i++) {
      logQuery(invokingResource, query, parseFloat(profiler[i].duration), parameters[offset + i]);
    }
    return;
  }

  if (typeof query === 'object') {
    for (let i = 0; i < profiler.length; i++) {
      const transaction = query[offset + i];
      if (!transaction) break;
      logQuery(invokingResource, transaction.query, parseFloat(profiler[i].duration), transaction.params);
    }
  }
}
