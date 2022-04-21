import { pool } from '.';
import { logQuery } from '../logger';
import { CFXParameters, TransactionQuery } from '../types';
import { parseTransaction } from '../utils/parseTransaction';
import { scheduleTick } from '../utils/scheduleTick';

const transactionError = (queries: { query: string; params: CFXParameters }[], parameters: CFXParameters) =>
  `${queries.map((query) => `${query.query} ${JSON.stringify(query.params || [])}`).join('\n')}\n${JSON.stringify(
    parameters
  )}`;

export const rawTransaction = async (
  invokingResource: string,
  queries: TransactionQuery,
  parameters: CFXParameters,
  callback?: (result: boolean) => void
) => {
  await scheduleTick();

  const { transactions, cb } = parseTransaction(invokingResource, queries, parameters, callback);
  const connection = await pool.promise().getConnection();
  let response = false;

  try {
    await connection.beginTransaction();

    for (const transaction of transactions) {
		//@ts-expect-error
		const [result, fields, executionTime] = await connection.query(transaction.query, transaction.params);
		//@ts-expect-error
		logQuery(invokingResource, transaction.query, executionTime, transaction.params);
	}

    await connection.commit();

    response = true;
  } catch (e) {
    await connection.rollback();

    console.error(
      `${invokingResource} was unable to execute a transaction!\n${(e as Error).message}\n${
        (e as any).sql || `${transactionError(transactions, parameters)}`
      }^0`
    );
  } finally {
    connection.release();
  }

  if (cb)
    try {
      cb(response);
    } catch {}
};
