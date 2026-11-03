import type { QueryResponse, QueryType } from '../types';

export const parseResponse = (type: QueryType, result: QueryResponse): any => {
  switch (type) {
    case 'insert':
      return (result as Record<string, any>)?.insertId ?? null;
    case 'update':
      return (result as Record<string, any>)?.affectedRows ?? null;
    case 'single':
      return (Array.isArray(result) ? result[0] : null) ?? null;
    case 'scalar':
      const row = Array.isArray(result) ? result[0] : null;
      return (row && Object.values(row)[0]) ?? null;
    default:
      return result ?? null;
  }
};
