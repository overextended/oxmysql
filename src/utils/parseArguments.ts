import type { CFXParameters } from '../types';
import { convertNamedPlaceholders } from '../config';

export const parseArguments = (query: string, parameters?: CFXParameters): [string, CFXParameters] => {
  if (typeof query !== 'string') throw new Error(`Expected query to be a string but received ${typeof query} instead.`);

  if (convertNamedPlaceholders && parameters && typeof parameters === 'object' && !Array.isArray(parameters))
    if (query.includes(':') || query.includes('@')) {
      const placeholders = convertNamedPlaceholders(query, parameters);
      query = placeholders[0];
      parameters = placeholders[1];
    }

  if (!parameters || typeof parameters === 'function') parameters = [];

  if (parameters && !Array.isArray(parameters)) {
    let arr: unknown[] = [];
    Object.entries(parameters).forEach((entry) => (arr[parseInt(entry[0]) - 1] = entry[1]));
    parameters = arr;
  } else {
    const queryParams = query.match(/\?(?!\?)/g);

    if (queryParams !== null) {
      if (parameters.length === 0) {
        for (let i = 0; i < queryParams.length; i++) parameters[i] = null;
        return [query, parameters];
      }
      const diff = queryParams.length - parameters.length;

      if (diff > 0) {
        for (let i = 0; i < diff; i++) parameters[queryParams.length + i] = null;
      } else if (diff < 0) {
        throw new Error(`Expected ${queryParams.length} parameters, but received ${parameters.length}.`);
      }
    }
  }

  return [query, parameters];
};
