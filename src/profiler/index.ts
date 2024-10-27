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

/**
 * Executes MySQL queries to enable accurate query profiling results when `mysql_debug` is enabled.
 */
export async function runProfiler(connection: MySql, invokingResource: string) {
  if (!mysql_debug) return;

  if (Array.isArray(mysql_debug) && !mysql_debug.includes(invokingResource)) return;

  for (const statement of profilerStatements) await connection.query(statement);

  return true;
}

/**
 * Fetches the duration of the last 100 queries and resets profiling history.
 */
export async function profileBatchStatements(
  connection: MySql,
  invokingResource: string,
  query: string | { query: string; params?: CFXParameters }[],
  parameters: CFXParameters | null,
  offset: number
) {
  const profiler = <RowDataPacket[]>(
    await connection.query(
      'SELECT FORMAT(SUM(DURATION) * 1000, 4) AS `duration` FROM INFORMATION_SCHEMA.PROFILING GROUP BY QUERY_ID'
    )
  );

  for (const statement of profilerStatements) await connection.query(statement);

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
