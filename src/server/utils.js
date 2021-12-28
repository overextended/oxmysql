import { resourceName } from './config.js';
const convertNamedPlaceholders = require('named-placeholders')();

export const scheduleTick = () => {
  ScheduleResourceTick(resourceName);
};

export let isReady = false;
let callbacks = [];

export let serverReady = async () => {
  return new Promise((resolve) => {
    if (callbacks.length === 0) {
      callbacks.push(resolve);
      const id = setInterval(() => {
        if (GetResourceState(resourceName) == 'started') {
          for (let i = 1; i < callbacks.length; i++) {
            callbacks[i]();
          }
          resolve(id);
        }
      }, 50);
    } else callbacks.push(resolve);
  }).then((id) => {
    if (id) {
      clearInterval(id);
      isReady = true;
      serverReady = undefined;
    }
  });
};

export const parseArguments = (invokingResource, query, parameters, cb) => {
  if (typeof query !== 'string') throw new Error(`Query expected a string but received ${typeof query} instead`);

  if (
    parameters &&
    typeof parameters === 'object' &&
    !Array.isArray(parameters) &&
    (query.includes(':') || query.includes('@'))
  ) {
    const placeholders = convertNamedPlaceholders(query, parameters);
    query = placeholders[0];
    parameters = placeholders[1];
  }

  if (cb && typeof cb !== 'function') {
    cb = undefined;
  }

  if (parameters && typeof parameters === 'function') {
    cb = parameters;
    parameters = [];
  } else if (parameters === null || parameters === undefined) parameters = [];

  if (!Array.isArray(parameters)) {
    let arr = [];
    Object.entries(parameters).forEach((entry) => {
      const [key, value] = entry;
      arr[key - 1] = value;
    });
    parameters = arr;
  } else {
    const queryParams = query.match(/\?(?!\?)/g);

    if (queryParams !== null) {
      if (parameters.length === 0) {
        for (let i = 0; i < queryParams.length; i++) parameters[i] = null;
        return [query, parameters, cb];
      }
      const diff = queryParams.length - parameters.length;

      if (diff > 0) {
        for (let i = 0; i < diff; i++) parameters[queryParams.length + i] = null;
      } else if (diff < 0) {
        throw new Error(`${invokingResource} was unable to execute a query!
          Expected ${queryParams.length} parameters, but received ${parameters.length}.
          ${`${query} ${JSON.stringify(parameters)}`}`);
      }
    }
  }

  return [query, parameters, cb];
};

export const parseTransaction = (invokingResource, queries, parameters) => {
  if (!Array.isArray(queries)) throw new Error(`Transaction queries must be array type`);

  const parsedTransaction = queries.map((query) => {
    const [parsedQuery, parsedParameters] = parseArguments(
      invokingResource,
      typeof query === 'object' ? query.query : query,
      (typeof query === 'object' && (query.parameters || query.values)) || parameters || []
    );
    return { query: parsedQuery, params: parsedParameters };
  });

  return parsedTransaction;
};

export const response = (type, result) => {
  switch (type) {
    case 'insert':
      return result && result.insertId;

    case 'update':
      return result && result.affectedRows;

    case 'scalar':
      return result && result[0] && Object.values(result[0])[0];

    case 'single':
      return result && result[0];

    default:
      return result;
  }
};

export const preparedTypes = (query) => {
  switch (query.replace(/\s.*/, '')) {
    case 'SELECT':
      return 'execute';
    case 'INSERT':
      return 'insert';
    case 'UPDATE':
      return 'update';
    case 'DELETE':
      return 'update';
    default:
      return false;
  }
};
