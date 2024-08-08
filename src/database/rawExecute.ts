import { logError, logQuery } from '../logger';
import { CFXCallback, CFXParameters, QueryType } from '../types';
import { parseResponse } from '../utils/parseResponse';
import { executeType, parseExecute } from '../utils/parseExecute';
import { getConnection } from './connection';
import { setCallback } from '../utils/setCallback';
import { performance } from 'perf_hooks';
import validateResultSet from 'utils/validateResultSet';
import { RowDataPacket } from 'mysql2';
import { profileBatchStatements, runProfiler } from 'profiler';

export const rawExecute = async (
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback,
  isPromise?: boolean,
  unpack?: boolean,
  connectionId?: number
) => {
  cb = setCallback(parameters, cb);

  let type: QueryType;
  let placeholders: number;

  try {
    type = executeType(query);
    placeholders = query.split('?').length - 1;
    parameters = parseExecute(placeholders, parameters);
  } catch (err: any) {
    return logError(invokingResource, cb, isPromise, err, query, parameters);
  }

  using connection = await getConnection(connectionId);

  if (!connection) return;

  try {
    const hasProfiler = await runProfiler(connection, invokingResource);
    const parametersLength = parameters.length == 0 ? 1 : parameters.length;
    const response = [] as any[];

    for (let index = 0; index < parametersLength; index++) {
      const values = parameters[index];

      if (values && placeholders > values.length) {
        for (let i = values.length; i < placeholders; i++) {
          values[i] = null;
        }
      }

      const startTime = !hasProfiler && performance.now();
      const result = await connection.execute(query, values);

      if (Array.isArray(result) && result.length > 1) {
        for (const value of result) {
          response.push(unpack ? parseResponse(type, value as RowDataPacket[]) : value);
        }
      } else response.push(unpack ? parseResponse(type, result) : result);

      if (hasProfiler && ((index > 0 && index % 100 === 0) || index === parametersLength - 1)) {
        await profileBatchStatements(connection, invokingResource, query, parameters, index < 100 ? 0 : index);
      } else if (startTime) {
        logQuery(invokingResource, query, performance.now() - startTime, values);
      }

      validateResultSet(invokingResource, query, result);
    }

    if (!cb) return response.length === 1 ? response[0] : response;

    try {
      if (response.length === 1) {
        if (unpack && type === null) {
          if (response[0][0] && Object.keys(response[0][0]).length === 1) {
            cb(Object.values(response[0][0])[0]);
          } else cb(response[0][0]);
        } else {
          cb(response[0]);
        }
      } else {
        cb(response);
      }
    } catch (err) {
      if (typeof err === 'string') {
        if (err.includes('SCRIPT ERROR:')) return console.log(err);
        console.log(`^1SCRIPT ERROR in invoking resource ${invokingResource}: ${err}^0`);
      }
    }
  } catch (err: any) {
    logError(invokingResource, cb, isPromise, err, query, parameters);
  }
};
