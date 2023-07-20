import { pool, isServerConnected, waitForConnection } from '.';
import { parseArguments } from '../utils/parseArguments';
import { parseResponse } from '../utils/parseResponse';
import { logQuery, printError, runProfiler } from '../logger';
import type { CFXCallback, CFXParameters } from '../types';
import type { QueryType } from '../types';
import { scheduleTick } from '../utils/scheduleTick';
import { RowDataPacket } from 'mysql2';

export const rawQuery = async (
  type: QueryType,
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback,
  isPromise?: boolean
) => {
  if (typeof query !== 'string')
    return printError(
      invokingResource,
      cb,
      isPromise,
      query,
      `Expected query to be a string but received ${typeof query} instead.`
    );

  [query, parameters, cb] = parseArguments(invokingResource, query, parameters, cb);

  if (!isServerConnected) await waitForConnection();

  scheduleTick();

  const connection = await pool.getConnection();

  try {
    const hasProfiler = await runProfiler(connection, invokingResource);
    const [result] = await connection.query(query, parameters);

    if (hasProfiler) {
      const [profiler] = <RowDataPacket[]>(
        await connection.query('SELECT FORMAT(SUM(DURATION) * 1000, 4) AS `duration` FROM INFORMATION_SCHEMA.PROFILING')
      );

      if (profiler[0]) logQuery(invokingResource, query, profiler[0].duration, parameters);
    }

    if (cb)
      try {
        cb(parseResponse(type, result));
      } catch (err) {
        if (typeof err === 'string') {
          if (err.includes('SCRIPT ERROR:')) return console.log(err);
          console.log(`^1SCRIPT ERROR in invoking resource ${invokingResource}: ${err}^0`);
        }
      }
  } catch (err: any) {
    printError(invokingResource, cb, isPromise, query, JSON.stringify(parameters), err.message);

    TriggerEvent('oxmysql:error', {
      query: query,
      parameters: parameters,
      message: err.message,
      err: err,
      resource: invokingResource,
    });
  } finally {
    connection.release();
  }
};
