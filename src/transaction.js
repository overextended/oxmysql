import { pool } from './pool';
import { parseParametersTransaction } from './parser';
import { slowQueryWarning, debug } from './config';

const resourceName = GetCurrentResourceName() || 'oxmysql';

const transaction = async (queries, parameters, resource) => {
  ScheduleResourceTick(resourceName);
  const connection = await pool.getConnection();
  try {
    const time = debug ? process.hrtime.bigint() : Date.now();

    const fullQuery = parseParametersTransaction(queries, parameters);
    const transactionAmount = fullQuery.length;

    await connection.beginTransaction();

    for (let i = 0; i < transactionAmount; i++) {
      await connection.query(fullQuery[i].query, fullQuery[i].params);
    };

    await connection.commit();

    const executionTime = debug ? Number(process.hrtime.bigint() - time) / 1e6 : Date.now() - time;

    if (executionTime >= slowQueryWarning * transactionAmount || debug)
      console.log(
        `^3[${debug ? 'DEBUG' : 'WARNING'}] ${resource} took ${executionTime}ms to execute a transaction!
                ${query} ${JSON.stringify(parameters)}^0`
      );

    return true;
  } catch (error) {
    await connection.rollback();
    console.log(
      `^1[ERROR] ${resource} was unable to execute a transaction!
            ${error.message}
            ${error.sql || `${queries} ${JSON.stringify(parameters)}`}^0`
    );
    debug && console.trace(error);
    return false;
  } finally {
    await connection.release();
  }
}

export { transaction };