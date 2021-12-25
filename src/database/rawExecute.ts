import { QueryError } from 'mysql2';
import { pool } from '.';
import { scheduleTick } from '../config';
import { logQuery } from '../logger';
import { CFXCallback, CFXParameters } from '../types';
import { parseExecute } from '../utils/parseExecute';

export const rawExecute = async (
  invokingResource: string,
  query: string,
  parameters: CFXParameters | CFXParameters[],
  cb?: CFXCallback
) => {
  const type = parseExecute(query);

  if (!type) throw new Error(`Prepared statements only accept SELECT, INSERT, UPDATE, and DELETE methods!`);

  scheduleTick();

  const connection = await pool.getConnection();

  try {
    const results = [];
    const executionTime = process.hrtime();

    if (Array.isArray(parameters)) for (const param of parameters) results.push(await connection.execute(query, param));
    else results.push(await connection.execute(query, parameters));

    logQuery(invokingResource, query, process.hrtime(executionTime)[1] / 1e6, parameters);

    // TODO: dont look at me taso
    let result;

    if (results.length === 1) {
      if (type === 'execute') {
        if (results[0][0] && Object.keys(results[0][0]).length === 1) result = Object.values(results[0][0])[0];
        else result = results[0][0];
      } else {
        result = results[0];
      }
    } else {
      result = results;
    }

    return cb ? cb(result) : result;
  } catch (e) {
    throw new Error(`${invokingResource} was unable to execute a query!
    ${(e as QueryError).message}
    ${(e as any).sql || `${query} ${JSON.stringify(parameters)}`}`);
  } finally {
    connection.release();
  }
};
