import { CFXParameters, TransactionQuery } from '../types';
import { parseArguments } from './parseArguments';

const isTransactionQuery = (query: TransactionQuery | string): query is TransactionQuery =>
  (query as TransactionQuery).query !== undefined;

export const parseTransaction = (queries: TransactionQuery, parameters: CFXParameters) => {
  if (!Array.isArray(queries)) throw new Error(`Transaction queries must be array, received '${typeof queries}'.`);

  if (!parameters || typeof parameters === 'function') parameters = [];

  if (Array.isArray(queries[0])) {
    const transactions = queries.map((query) => {
      if (typeof query[1] !== 'object')
        throw new Error(`Transaction parameters must be array or object, received '${typeof query[1]}'.`);
      const [parsedQuery, parsedParameters] = parseArguments(query[0], query[1]);

      return { query: parsedQuery, params: parsedParameters };
    });

    return transactions;
  }

  const transactions = queries.map((query) => {
    const [parsedQuery, parsedParameters] = parseArguments(
      isTransactionQuery(query) ? query.query : query,
      isTransactionQuery(query) ? query.parameters || query.values : parameters
    );

    return { query: parsedQuery, params: parsedParameters };
  });

  return transactions;
};
