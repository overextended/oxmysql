import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { QueryResponse, QueryType } from '../types';

export const parseResponse = (type: QueryType, result: QueryResponse): any => {
  switch (type) {
    case 'insert':
      return (result as ResultSetHeader)?.insertId ?? null;

    case 'update':
      return (result as ResultSetHeader)?.affectedRows ?? null;

    case 'single':
      return (result as RowDataPacket[])?.[0] ?? null;

    case 'scalar':
      const row = (result as RowDataPacket[])?.[0];
      return (row && Object.values(row)[0]) ?? null;

    default:
      return result ?? null;
  }
};
