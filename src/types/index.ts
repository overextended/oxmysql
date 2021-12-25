import { RowDataPacket, ResultSetHeader, OkPacket } from 'mysql2';

export type QueryResponse = RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader;

export type QueryType = 'insert' | 'update' | 'scalar' | 'single' | null;

export type TransactionQuery = {
  query: string;
  parameters?: CFXParameters;
  values?: CFXParameters;
};

export type CFXParameters = Record<string, unknown> | unknown[];

export type CFXCallback = (result: QueryResponse | RowDataPacket | number | null) => void;
