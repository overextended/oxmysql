import { mysql_debug } from 'config';
import type { MySql } from 'database';
import { logQuery } from 'logger';
import type { RowDataPacket } from 'mysql2';
import type { CFXParameters } from 'types';

const profilerStatements = [
  'SET profiling_history_size = 0',
  'SET profiling = 0',
  'SET profiling_history_size = 100',
  'SET profiling = 1',
];

// MySQL/MariaDB support the legacy `SET profiling` / `INFORMATION_SCHEMA.PROFILING`
// query profiler used below. Other MySQL-protocol-compatible databases (e.g. TiDB)
// don't implement it, so once it errors we stop attempting it for the remainder of
// the process rather than failing every subsequent query made while debug logging
// is enabled.
let profilerSupported: boolean | undefined;

/**
 * Marks the profiler as unsupported by the connected database so subsequent calls skip
 * straight to the fallback timing path instead of re-attempting the MySQL-only statements.
 */
export function markProfilerUnsupported() {
  profilerSupported = false;
}

/**
 * Executes MySQL queries to enable accurate query profiling results when `mysql_debug` is enabled.
 * Returns `false` (instead of throwing) if the connected database doesn't support the profiler,
 * so callers can fall back to plain timing instead of failing the query itself.
 */
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
        `^3Query profiling is unavailable on this database server (${err instanceof Error ? err.message : err}). Falling back to basic query timing.^0`,
      );
    }

    profilerSupported = false;

    return false;
  }
}

/**
 * Fetches the duration of the last 100 queries and resets profiling history.
 */
export async function profileBatchStatements(
  connection: MySql,
  invokingResource: string,
  query: string | { query: string; params?: CFXParameters }[],
  parameters: CFXParameters | null,
  offset: number,
) {
  let profiler: RowDataPacket[];

  try {
    profiler = <RowDataPacket[]>(
      await connection.query(
        'SELECT FORMAT(SUM(DURATION) * 1000, 4) AS `duration` FROM INFORMATION_SCHEMA.PROFILING GROUP BY QUERY_ID',
      )
    );

    for (const statement of profilerStatements) await connection.query(statement);
  } catch {
    profilerSupported = false;
    return;
  }

  if (profiler.length === 0) return;

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
