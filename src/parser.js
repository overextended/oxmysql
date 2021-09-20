import { FormatError } from './errors';
import * as createCompiler from 'named-placeholders';

const convertNamedPlaceholders = createCompiler();

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
      if (field.length === 1) return field.string() === '1';
      else return next();
    case 'BIT':
      return field.buffer()[0] === 1;
    default:
      return next();
  }
};

const parseParameters = (query, parameters) => {
  if (query === undefined) throw new FormatError(`Undefined query passed`);

  if (query.includes('@') || query.includes(':')) return [query, parameters];

  const queryParams = query.match(/\?(?!\?)/g);

  if (queryParams === null) return [query, []];

  if (parameters === undefined)
    throw new FormatError(`Placeholders was defined in query but no parameters provided!`, query);

  if (Array.isArray(parameters)) {
    if (parameters.length !== queryParams.length)
      throw new Error(`Undefined array parameter #${parameters.length}`, query, parameters);
  } else {
    queryParams.forEach((_, i) => {
      if (parameters[`${i + 1}`] === undefined) throw new FormatError(`Undefined object parameter #${i + 1}`, query, parameters);
    });
  }

  return [query, parameters];
};

const parseParametersTransaction = (queries, parameters) => {
  //https://github.com/GHMatti/ghmattimysql/blob/37f1d2ae5c53f91782d168fe81fba80512d3c46d/packages/ghmattimysql/src/server/utility/sanitizeTransactionInput.ts#L5
  
  const cleanedTransactions = queries.map( (query) => {
    let params;

    if (typeof query === 'string') {
      [query, params] = parseParameters(query, parameters || []);
      return { query: query, params: params };
    }

    [query, params] = parseParameters(query.query, query.parameters || query.values || []);
    return { query: query, params: params };
  });

  return cleanedTransactions;
};

export { parseParameters, parseTypes, parseParametersTransaction };
