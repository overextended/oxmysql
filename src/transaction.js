import { pool } from './pool';
import { parseTransaction } from './parser';
import { slowQueryWarning, debug, resourceName } from './config';

const transactionError = (queries, parameters) =>
  `${queries
    .map((query) =>
      typeof query === 'string' ? query : `${query.query} ${JSON.stringify(query.values || query.parameters || [])}`
    )
    .join('\n')}\n${JSON.stringify(parameters)}`;

const transaction = async (queries, parameters, resource) => {
  ScheduleResourceTick(resourceName);
  const connection = await pool.getConnection();
  try {

    const fullQuery = parseTransaction(queries, parameters);
    const transactionAmount = fullQuery.length;
    const startTime = process.hrtime();

    await connection.beginTransaction();

    for (let i = 0; i < transactionAmount; i++) {
      await connection.query(fullQuery[i].query, fullQuery[i].params);
    }

    await connection.commit();

    const executionTime = process.hrtime(startTime)[1] / 1000000;

    if (executionTime >= slowQueryWarning * transactionAmount || debug)
      console.log(
        `^3[${
          debug ? 'DEBUG' : 'WARNING'
        }] ${resource} took ${executionTime}ms to execute a transaction!\n${transactionError(queries, parameters)}^0`
      );

    return true;
  } catch (error) {
    await connection.rollback();
    console.log(
      `^1[ERROR] ${resource} was unable to execute a transaction!
            ${error.message}
            ${error.sql || `${transactionError(queries, parameters)}`}^0`
    );
    debug && console.trace(error);
  } finally {
    connection.release();
  }
};

export { transaction };
