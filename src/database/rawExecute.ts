import { QueryError, ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '.';
import { scheduleTick } from '../config';
import { logQuery } from '../logger';
import { CFXCallback, CFXParameters, QueryResponse } from '../types';
import { parseResponse } from '../utils/parseResponse';
import { parseExecute } from '../utils/parseExecute';

export const rawExecute = async (
  invokingResource: string,
  query: string,
  parameters: CFXParameters | CFXParameters[],
  cb?: CFXCallback
) => {
  const type = parseExecute(query);

  if (!type) throw new Error(`Prepared statements only accept SELECT, INSERT, UPDATE, and DELETE methods!`);

  if (!Array.isArray(parameters))
    throw new Error(`Parameters expected an array but received ${typeof parameters} instead`);

  scheduleTick();

  const connection = await pool.getConnection();
  let result: QueryResponse;

  try {
    if (!parameters.every(Array.isArray)) parameters = [[...parameters]];

    const results = [] as RowDataPacket;
    const executionTime = process.hrtime();

    for (const params of parameters) {
      const [rows] = (await connection.execute(query, params)) as RowDataPacket[][];
      if (rows.length > 1) {
        for (const row of rows) {
          results.push(parseResponse(type, row));
        }
      } else results.push(parseResponse(type, rows));

      logQuery(invokingResource, query, process.hrtime(executionTime)[1] / 1e6, params as typeof parameters);
    }

    result = results;

    if (results.length === 1) {
      if (type === 'execute') {
        if (results[0][0] && Object.keys(results[0][0]).length === 1) result = Object.values(results[0][0])[0] as any;
        else result = results[0][0];
      } else {
        result = results[0];
      }
    } else {
      result = results;
    }

    if (!cb) return result;
  } catch (e) {
    throw new Error(`${invokingResource} was unable to execute a query!
    ${(e as QueryError).message}
    ${(e as any).sql || `${query} ${JSON.stringify(parameters)}`}`);
  } finally {
    connection.release();
  }

  if (cb) cb(result);
};
