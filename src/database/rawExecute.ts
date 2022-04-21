import { RowDataPacket } from 'mysql2';
import { pool } from '.';
import { logQuery } from '../logger';
import { CFXCallback, CFXParameters } from '../types';
import { parseResponse } from '../utils/parseResponse';
import { executeType, parseExecute, parseValues } from '../utils/parseExecute';
import { scheduleTick } from '../utils/scheduleTick';

export const rawExecute = async (
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback
) => {
  const type = executeType(query);
  parameters = parseExecute(parameters);
  const response = [] as RowDataPacket;
  let single: boolean;

  if (!parameters.every(Array.isArray)) parameters = [[...parameters]];

  await scheduleTick();

  const connection = await pool.promise().getConnection();

  try {
    const placeholders = query.split('?').length - 1;

    for (let values of parameters as CFXParameters[]) {
      const executionTime = process.hrtime();
      values = parseValues(placeholders, values);

      const [results, _] = (await connection.execute(query, values)) as RowDataPacket[][];

      if (cb) {
        if (results.length > 1) {
          for (const value of results) {
            response.push(parseResponse(type, value));
          }
        } else response.push(parseResponse(type, results));
      }

      logQuery(invokingResource, query, process.hrtime(executionTime)[1] / 1e6, values as typeof parameters);
    }

    single = response.length === 1;
  } catch (err: any) {
    throw new Error(`${invokingResource} was unable to execute a query!
	${err.message}
	${err.sql}`);
  } finally {
    connection.release();
  }

  if (cb) {
    if (single) {
      if (type === null) {
        //@ts-expect-error
        if (response[0][0] && Object.keys(response[0][0]).length === 1) cb(Object.values(response[0][0])[0]);
        else cb(response[0][0]);
      } else {
        cb(response[0]);
      }
    } else {
      cb(response);
    }
  }
};
