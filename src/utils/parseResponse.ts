import { OkPacket, RowDataPacket } from 'mysql2';
import type { QueryResponse, QueryType } from '../types';

const isOkPacket = (result: QueryResponse, insertId?: boolean): result is OkPacket =>
  insertId ? (result as OkPacket).insertId !== undefined : (result as OkPacket).affectedRows !== undefined;

const isRowDataPacket = (result: QueryResponse): result is RowDataPacket[] =>
  (result as RowDataPacket[]).length !== undefined;

const isRowDataPacketArray = (result: QueryResponse): result is RowDataPacket[][] =>
  (result as RowDataPacket[][]).length !== undefined &&
  (result as RowDataPacket[][])[0] !== undefined &&
  Object.values((result as RowDataPacket[][])[0])[0] !== undefined;

export const parseResponse = (type: QueryType, result: QueryResponse): any => {
  switch (type) {
    case 'insert':
      return isOkPacket(result) ? result.insertId : null;

    case 'update':
      return isOkPacket(result) ? result.affectedRows : null;

    case 'single':
      return isRowDataPacket(result) ? result[0] : null;

    case 'scalar':
      return isRowDataPacketArray(result) ? Object.values(result[0])[0] : null;

    default:
      return result || null;
  }
};
