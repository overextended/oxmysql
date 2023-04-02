import type { CFXCallback, CFXParameters } from '../types';
import { connectionOptions } from '../config';

const convertNamedPlaceholders = connectionOptions.namedPlaceholders && require('named-placeholders')();

export const parseArguments = (
  invokingResource: string,
  query: string,
  parameters?: CFXParameters,
  cb?: CFXCallback
): [string, CFXParameters, CFXCallback | undefined] => {
  if (convertNamedPlaceholders && parameters && typeof parameters === 'object' && !Array.isArray(parameters))
    if (query.includes(':') || query.includes('@')) {
      const placeholders = convertNamedPlaceholders(query, parameters);
      query = placeholders[0];
      parameters = placeholders[1];
    }

  if (cb && typeof cb !== 'function') cb = undefined;

  if (parameters && typeof parameters === 'function') {
    cb = parameters;
    parameters = [];
  } else if (parameters === null || parameters === undefined) parameters = [];

  if (parameters && !Array.isArray(parameters)) {
    let arr: unknown[] = [];
    Object.entries(parameters).forEach((entry) => (arr[parseInt(entry[0]) - 1] = entry[1]));
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
        throw new Error(
          `${invokingResource} was unable to execute a query!\nExpected ${
            queryParams.length
          } parameters, but received ${parameters.length}.\n${`${query} ${JSON.stringify(parameters)}`}`
        );
      }
    }
  }

  return [query, parameters, cb];
};
