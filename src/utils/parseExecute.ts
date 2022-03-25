import { CFXParameters } from '../types';

export const executeType = (query: string) => {
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

export const parseExecute = (query: string, parameters: CFXParameters | CFXParameters[]) => {
  if (!Array.isArray(parameters))
    if (typeof parameters === 'object') {
      const arr: unknown[] = [];
      Object.entries(parameters).forEach((entry) => (arr[parseInt(entry[0]) - 1] = entry[1]));
      parameters = arr;
    } else throw new Error(`Parameters expected an array but received ${typeof parameters} instead`);

  if (!parameters.every(Array.isArray)) parameters = [[...parameters]];

  return parameters;
};
