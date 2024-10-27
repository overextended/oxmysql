import type { CFXParameters } from '../types';
import { convertNamedPlaceholders } from '../config';

export const parseArguments = (query: string, parameters?: CFXParameters): [string, CFXParameters] => {
  if (typeof query !== 'string') throw new Error(`Expected query to be a string but received ${typeof query} instead.`);

  if (convertNamedPlaceholders && parameters && typeof parameters === 'object' && !Array.isArray(parameters))
    if (query.includes(':') || query.includes('@')) {
      [query, parameters] = convertNamedPlaceholders(query, parameters);
    }

  if (!parameters || typeof parameters === 'function') parameters = [];

  const placeholders = query.match(/\?(?!\?)/g)?.length ?? 0;

  if (parameters && !Array.isArray(parameters)) {
    let arr: unknown[] = [];

    for (let i = 0; i < placeholders; i++) {
      arr[i] = parameters[i + 1] ?? null;
    }

    parameters = arr;
  } else {
    if (placeholders) {
      if (parameters.length === 0) {
        for (let i = 0; i < placeholders; i++) parameters[i] = null;
        return [query, parameters];
      }

      const diff = placeholders - parameters.length;

      if (diff > 0) {
        for (let i = 0; i < diff; i++) parameters[placeholders + i] = null;
      } else if (diff < 0) {
        throw new Error(`Expected ${placeholders} parameters, but received ${parameters.length}.`);
      }
    }
  }

  return [query, parameters];
};
