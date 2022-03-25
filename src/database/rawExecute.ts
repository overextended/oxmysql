import { QueryError, ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '.';
import { logQuery } from '../logger';
import { CFXCallback, CFXParameters, QueryResponse } from '../types';
import { parseResponse } from '../utils/parseResponse';
import { executeType, parseExecute } from '../utils/parseExecute';
import { scheduleTick } from '../utils/scheduleTick';

export const rawExecute = async (
  invokingResource: string,
  query: string,
  parameters: CFXParameters | CFXParameters[],
  cb?: CFXCallback
) => {
  const type = executeType(query);

  if (!type) throw new Error(`Prepared statements only accept SELECT, INSERT, UPDATE, and DELETE methods.`);

  parameters = parseExecute(parameters);

  await scheduleTick();

  const connection = await pool.promise().getConnection();
  let response: QueryResponse;

  try {
    const results = [] as RowDataPacket;
    const executionTime = process.hrtime();

    for (const values of parameters) {
      const [rows] = (await connection.execute(query, values)) as RowDataPacket[][];
      if (rows.length > 1) {
        for (const row of rows) {
          results.push(parseResponse(type, row));
        }
      } else results.push(parseResponse(type, rows));

      logQuery(invokingResource, query, process.hrtime(executionTime)[1] / 1e6, values as typeof parameters);
    }

    response = results;

    if (results.length === 1) {
      if (type === 'execute') {
        if (results[0][0] && Object.keys(results[0][0]).length === 1) response = Object.values(results[0][0])[0] as any;
        else response = results[0][0];
      } else {
        response = results[0];
      }
    } else {
      response = results;
    }
  } catch (e) {
    throw new Error(`${invokingResource} was unable to execute a query!
    ${(e as QueryError).message}
    ${`${query} ${JSON.stringify(parameters)}`}`);
  } finally {
    connection.release();
  }

  if (cb)
    try {
      cb(response);
    } catch {}
};
