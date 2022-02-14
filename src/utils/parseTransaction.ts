import { CFXCallback, CFXParameters, TransactionQuery } from '../types';
import { parseArguments } from './parseArguments';

const isTransactionQuery = (query: TransactionQuery | string): query is TransactionQuery =>
  (query as TransactionQuery).query !== undefined;

export const parseTransaction = (
  invokingResource: string,
  queries: TransactionQuery[] | string[],
  parameters: CFXParameters,
  cb?: (result: boolean) => void
) => {
  if (!Array.isArray(queries)) throw new Error(`Transaction queries must be array type`);

  if (cb && typeof cb !== 'function') cb = undefined;

  if (parameters && typeof parameters === 'function') cb = parameters;

  if (parameters === null || parameters === undefined || typeof parameters === 'function') parameters = [];

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
