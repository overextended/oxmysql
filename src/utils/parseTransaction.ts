import { CFXParameters, TransactionQuery } from '../types';
import { parseArguments } from './parseArguments';

const isTransactionQuery = (query: TransactionQuery | string): query is TransactionQuery =>
  (query as TransactionQuery).query !== undefined;

export const parseTransaction = (
  invokingResource: string,
  queries: TransactionQuery,
  parameters: CFXParameters,
  cb?: (result: boolean) => void
) => {
  if (!Array.isArray(queries)) throw new Error(`Transaction queries must be array, received '${typeof queries}'.`);

  if (cb && typeof cb !== 'function') cb = undefined;

  if (parameters && typeof parameters === 'function') cb = parameters;

  if (parameters === null || parameters === undefined || typeof parameters === 'function') parameters = [];

  if (Array.isArray(queries[0])) {
    const transactions = queries.map((query) => {
		if (typeof query[1] !== 'object') throw new Error(`Transaction parameters must be array or object, received '${typeof query[1]}'.`);
      const [parsedQuery, parsedParameters] = parseArguments(
        invokingResource,
        query[0],
        query[1]
      );
      return { query: parsedQuery, params: parsedParameters };
    });

    return { transactions, cb };
  }

  const transactions = queries.map((query) => {
    const [parsedQuery, parsedParameters] = parseArguments(
      invokingResource,
      isTransactionQuery(query) ? query.query : query,
      isTransactionQuery(query) ? query.parameters || query.values : parameters || []
    );
    return { query: parsedQuery, params: parsedParameters };
  });

  return { transactions, cb };
};
