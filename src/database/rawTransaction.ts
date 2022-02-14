import { pool } from '.';
import { scheduleTick } from '../config';
import { logQuery } from '../logger';
import { CFXParameters, TransactionQuery } from '../types';
import { parseTransaction } from '../utils/parseTransaction';

const transactionError = (queries: { query: string; params: CFXParameters }[], parameters: CFXParameters) =>
  `${queries.map((query) => `${query.query} ${JSON.stringify(query.params || [])}`).join('\n')}\n${JSON.stringify(
    parameters
  )}`;

export const rawTransaction = async (
  invokingResource: string,
  queries: TransactionQuery[] | string[],
  parameters: CFXParameters,
  callback?: (result: boolean) => void
) => {
  scheduleTick();

  const { transactions, cb } = parseTransaction(invokingResource, queries, parameters, callback);

  const connection = await pool.getConnection();

  try {
    const executionTime = process.hrtime();

    await connection.beginTransaction();

    for (const transaction of transactions) await connection.query(transaction.query, transaction.params);

    await connection.commit();

    logQuery(invokingResource, 'TRANSACTION', process.hrtime(executionTime)[1] / 1e6, parameters);

    return cb ? cb(true) : true;
  } catch (e) {
    await connection.rollback();

    console.error(
      `${invokingResource} was unable to execute a transaction!\n${(e as Error).message}\n${
        (e as any).sql || `${transactionError(transactions, parameters)}`
      }^0`
    );

    return cb ? cb(false) : false;
  } finally {
    connection.release();
  }
};
