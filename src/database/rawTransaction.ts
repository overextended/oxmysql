import { pool, isServerConnected, waitForConnection } from '.';
import { printError, profileBatchStatements, runProfiler } from '../logger';
import { CFXCallback, CFXParameters, TransactionQuery } from '../types';
import { parseTransaction } from '../utils/parseTransaction';
import { scheduleTick } from '../utils/scheduleTick';
import { setCallback } from '../utils/setCallback';

const transactionError = (queries: { query: string; params?: CFXParameters }[], parameters: CFXParameters) => {
  `${queries.map((query) => `${query.query} ${JSON.stringify(query.params || [])}`).join('\n')}\n${JSON.stringify(
    parameters
  )}`;
};

export const rawTransaction = async (
  invokingResource: string,
  queries: TransactionQuery,
  parameters: CFXParameters,
  cb?: CFXCallback,
  isPromise?: boolean
) => {
  if (!isServerConnected) await waitForConnection();

  scheduleTick();

  cb = setCallback(parameters, cb);
  const transactions = parseTransaction(invokingResource, queries, parameters);
  const connection = await pool.getConnection();
  const hasProfiler = await runProfiler(connection, invokingResource);
  let response = false;

  try {
    await connection.beginTransaction();
    const transactionsLength = transactions.length;

    for (let i = 0; i < transactionsLength; i++) {
      const transaction = transactions[i];

      await connection.query(transaction.query, transaction.params);

      if (hasProfiler && ((i > 0 && i % 100 === 0) || i === transactionsLength - 1)) {
        await profileBatchStatements(connection, invokingResource, transactions, null, i < 100 ? 0 : i);
      }
    }

    await connection.commit();

    response = true;
  } catch (err: any) {
    await connection.rollback().catch(() => {});

    const transactionErrorMessage = err.sql || transactionError(transactions, parameters);

    printError(invokingResource, cb, isPromise, transactionErrorMessage, err.message);

    TriggerEvent('oxmysql:transaction-error', {
      query: transactionErrorMessage,
      parameters: parameters,
      message: err.message,
      err: err,
      resource: invokingResource,
    });
  } finally {
    connection.release();
  }

  if (cb)
    try {
      cb(response);
    } catch (err) {
      if (typeof err === 'string') {
        if (err.includes('SCRIPT ERROR:')) return console.log(err);
        console.log(`^1SCRIPT ERROR in invoking resource ${invokingResource}: ${err}^0`);
      }
    }
};
