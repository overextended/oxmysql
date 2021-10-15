import { FormatError } from './errors';

const parseTypes = (field, next) => {
  //https://github.com/GHMatti/ghmattimysql/blob/37f1d2ae5c53f91782d168fe81fba80512d3c46d/packages/ghmattimysql/src/server/utility/typeCast.ts#L3
  switch (field.type) {
    case 'DATETIME':
    case 'DATETIME2':
    case 'TIMESTAMP':
    case 'TIMESTAMP2':
    case 'NEWDATE':
    case 'DATE':
      return field.type === 'DATE'
        ? new Date(field.string() + ' 00:00:00').getTime()
        : new Date(field.string()).getTime();
    case 'TINY':
      if (field.length == 1) return field.string() === '1';
      else return next();
    case 'BIT':
      return field.buffer()[0] === 1;
    default:
      return next();
  }
};

const parseParameters = (query, parameters) => {
  if (query === undefined) throw new FormatError(`Undefined query passed`);

  if (typeof parameters === 'function') return [query, []];

  if (query.includes('@') || query.includes(':')) return [query, parameters];

  const queryParams = query.match(/\?(?!\?)/g);

  if (queryParams === null) return [query, []];

  if (parameters === undefined)
    throw new FormatError(`Placeholders were defined, but query received no parameters!`, query);

  if (!Array.isArray(parameters)) {
    let arr = [];
    Object.entries(parameters).forEach((entry) => {
      const [key, value] = entry;
      arr[key - 1] = value;
    });
    parameters = arr;
  }
  if (Array.isArray(parameters)) {
    if (parameters.length === 0) {
      for (let i = 0; i < queryParams.length; i++) parameters[i] = null;
      return [query, parameters];
    }
    const diff = queryParams.length - parameters.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) parameters[queryParams.length + i] = null;
    }
  }

  return [query, parameters];
};

const parseTransaction = (queries, parameters) => {
  //https://github.com/GHMatti/ghmattimysql/blob/37f1d2ae5c53f91782d168fe81fba80512d3c46d/packages/ghmattimysql/src/server/utility/sanitizeTransactionInput.ts#L5

  if (!Array.isArray(queries)) throw new Error(`Transaction queries must be array type`);

  const parsedTransaction = queries.map((query) => {
    const [parsedQuery, parsedParameters] = parseParameters(
      typeof query === 'object' ? query.query : query,
      (typeof query === 'object' && (query.parameters || query.values)) || parameters || []
    );
    return { query: parsedQuery, params: parsedParameters };
  });

  return parsedTransaction;
};

export { parseTypes, parseParameters, parseTransaction };
