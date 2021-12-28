import { mysql_debug, mysql_slow_query_warning } from '../config.js';
import { isReady, parseTransaction, scheduleTick, serverReady } from '../utils.js';
import pool from './pool.js';
const hrtime = require('process').hrtime;

const transactionError = (queries, parameters) =>
  `${queries
    .map((query) =>
      typeof query === 'string' ? query : `${query.query} ${JSON.stringify(query.values || query.parameters || [])}`
    )
    .join('\n')}\n${JSON.stringify(parameters)}`;

export default async (invokingResource, queries, parameters, cb) => {
  if (!isReady) serverReady();
  scheduleTick();
  const connection = await pool.getConnection();
  let result;

  try {
    const parsedQuery = parseTransaction(invokingResource, queries, parameters);
    let queryCount = parsedQuery.length;
    let executionTime = hrtime();

    await connection.beginTransaction();

    for (let i = 0; i < queryCount; i++) {
      await connection.query(parsedQuery[i].query, parsedQuery[i].params);
    }

    await connection.commit();

    executionTime = hrtime(executionTime)[1] / 1000000;
    if (executionTime >= mysql_slow_query_warning || mysql_debug)
      console.log(
        `^3[${
          mysql_debug ? 'DEBUG' : 'WARNING'
        }] ${invokingResource} took ${executionTime}ms to execute a transaction!\n${transactionError(
          queries,
          parameters
        )}^0`
      );

    result = true;
    if (parameters && typeof parameters === 'function') cb = parameters;
  } catch (error) {
    await connection.rollback();
    console.log(
      `^1[ERROR] ${invokingResource} was unable to execute a transaction!
            ${error.message}
            ${error.sql || `${transactionError(queries, parameters)}`}^0`
    );
    return false;
  } finally {
    connection.release();
  }
  if (cb) cb(result);
  else return result;
};
