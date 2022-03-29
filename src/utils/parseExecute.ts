import { CFXParameters } from '../types';

export const executeType = (query: string) => {
  switch (query.replace(/\s.*/, '')) {
    case 'SELECT':
      return null;
    case 'INSERT':
      return 'insert';
    case 'UPDATE':
      return 'update';
    case 'DELETE':
      return 'update';
    default:
      throw new Error(`Prepared statements only accept SELECT, INSERT, UPDATE, and DELETE methods.`);
  }
};

export const parseExecute = (parameters: CFXParameters) => {
  if (!Array.isArray(parameters)) {
    if (typeof parameters === 'object') {
      const arr: unknown[] = [];
      Object.entries(parameters).forEach((entry) => (arr[parseInt(entry[0]) - 1] = entry[1]));
      parameters = arr;
    } else throw new Error(`Parameters expected an array but received ${typeof parameters} instead`);
  }

  return parameters;
};

export const parseValues = (placeholders: number, parameters: CFXParameters) => {
  if (!Array.isArray(parameters)) {
    if (typeof parameters === 'object') {
      const arr: unknown[] = [];
      Object.entries(parameters).forEach((entry) => (arr[parseInt(entry[0]) - 1] = entry[1]));
      parameters = arr;
    } else throw new Error(`Parameters expected an array but received ${typeof parameters} instead`);
  } else if (placeholders > parameters.length) {
    for (let i = parameters.length; i < placeholders; i++) {
      parameters[i] = null;
    }
  }

  return parameters;
};
