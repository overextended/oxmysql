import { parseArguments } from '../utils/parseArguments';
import { setCallback } from '../utils/setCallback';
import { parseResponse } from '../utils/parseResponse';
import { logQuery, logError } from '../logger';
import type { CFXCallback, CFXParameters } from '../types';
import type { QueryType } from '../types';
import { getConnection } from './connection';
import { RowDataPacket } from 'mysql2';
import { performance } from 'perf_hooks';
import validateResultSet from 'utils/validateResultSet';
import { runProfiler } from 'profiler';

export const rawQuery = async (
  type: QueryType,
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback,
  isPromise?: boolean,
  connectionId?: number
) => {
  cb = setCallback(parameters, cb);
  try {
    [query, parameters] = parseArguments(query, parameters);
  } catch (err: any) {
    return logError(invokingResource, cb, isPromise, err, query, parameters);
  }

  using connection = await getConnection(connectionId);

  if (!connection) return;

  try {
    const hasProfiler = await runProfiler(connection, invokingResource);
    const startTime = !hasProfiler && performance.now();
    const result = await connection.query(query, parameters);

    if (hasProfiler) {
      const profiler = <RowDataPacket[]>(
        await connection.query('SELECT FORMAT(SUM(DURATION) * 1000, 4) AS `duration` FROM INFORMATION_SCHEMA.PROFILING')
      );

      if (profiler[0]) logQuery(invokingResource, query, parseFloat(profiler[0].duration), parameters);
    } else if (startTime) {
      logQuery(invokingResource, query, performance.now() - startTime, parameters);
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
    logError(invokingResource, cb, isPromise, err, query, parameters, true);
  }
};
