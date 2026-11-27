import { parseArguments } from '../utils/parseArguments';
import { setCallback } from '../utils/setCallback';
import { parseResponse } from '../utils/parseResponse';
import { logQuery, logError, logBuilderTiming } from '../logger';
import type { CFXCallback, CFXParameters } from '../types';
import type { QueryType } from '../types';
import { getConnection } from './connection';
import { RowDataPacket } from 'mysql2';
import { performance } from 'perf_hooks';
import validateResultSet from 'utils/validateResultSet';
import { markProfilerUnsupported, runProfiler } from 'profiler';

export const rawQuery = async (
  type: QueryType,
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback,
  isPromise?: boolean,
  connectionId?: number,
  builderDebug = false,
) => {
  cb = setCallback(parameters, cb);
  try {
    [query, parameters] = parseArguments(query, parameters);
  } catch (err: any) {
    return logError(invokingResource, cb, isPromise, err, query, parameters);
  }

  await using connection = await getConnection(connectionId);

  if (!connection) return;

  let queryStartedAt: number | undefined;
  try {
    const hasProfiler = await runProfiler(connection, invokingResource);
    if (!hasProfiler || builderDebug) queryStartedAt = performance.now();
    const result = await connection.query(query, parameters);
    let executionTime = queryStartedAt === undefined ? undefined : performance.now() - queryStartedAt;
    queryStartedAt = undefined;
    const builderExecutionTime = builderDebug ? executionTime : undefined;

    if (hasProfiler) {
      try {
        const profiler = <RowDataPacket[]>(
          await connection.query(
            'SELECT FORMAT(SUM(DURATION) * 1000, 4) AS `duration` FROM INFORMATION_SCHEMA.PROFILING',
          )
        );

        if (profiler[0]) executionTime = parseFloat(profiler[0].duration);
      } catch {
        // Database doesn't actually support INFORMATION_SCHEMA.PROFILING (e.g. TiDB) even though
        // the SET profiling statements succeeded; disable profiling for subsequent queries.
        markProfilerUnsupported();
      }
    }
    if (executionTime !== undefined) {
      logQuery(invokingResource, query, executionTime, parameters, builderExecutionTime);
    }

    validateResultSet(invokingResource, query, result);

    if (!cb) return parseResponse(type, result);

    try {
      cb(parseResponse(type, result));
    } catch (err) {
      if (typeof err === 'string') {
        if (err.includes('SCRIPT ERROR:')) return console.log(err);
        console.log(`^1SCRIPT ERROR in invoking resource ${invokingResource}: ${err}^0`);
      }
    }
  } catch (err: any) {
    if (builderDebug && queryStartedAt !== undefined)
      logBuilderTiming(invokingResource, query, performance.now() - queryStartedAt, true);
    logError(invokingResource, cb, isPromise, err, query, parameters, true);
  }
};
