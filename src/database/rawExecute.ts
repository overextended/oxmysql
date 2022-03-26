import { QueryError, ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '.';
import { logQuery } from '../logger';
import { CFXCallback, CFXParameters, QueryResponse } from '../types';
import { parseResponse } from '../utils/parseResponse';
import { executeType, parseExecute, parseValues } from '../utils/parseExecute';
import { scheduleTick } from '../utils/scheduleTick';

export const rawExecute = async (
  invokingResource: string,
  query: string,
  parameters: CFXParameters | CFXParameters[],
  cb?: CFXCallback
) => {
  const type = executeType(query);

  parameters = parseExecute(parameters);

  await scheduleTick();

  const connection = await pool.promise().getConnection();
  let response: QueryResponse;

  try {
    const placeholders = query.split('?').length - 1;
    const results = [] as RowDataPacket;
    const executionTime = process.hrtime();

	if (type !== null) await connection.beginTransaction();

    for (let values of parameters as CFXParameters[]) {
      values = parseValues(placeholders, values);
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
      if (type === null) {
        if (results[0][0] && Object.keys(results[0][0]).length === 1) response = Object.values(results[0][0])[0] as any;
        else response = results[0][0];
      } else {
        response = results[0];
      }
    } else {
      response = results;
    }

    if (type !== null) await connection.commit();
  } catch (e) {
    await connection.rollback();

    throw new Error(`${invokingResource} was unable to execute a query!
    ${(e as QueryError).message}
    ${`${(e as any).sql}`}`);
  } finally {
    connection.release();
  }

  if (cb)
    try {
      cb(response);
    } catch {}
};
