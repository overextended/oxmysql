import { RowDataPacket, ResultSetHeader, OkPacket } from 'mysql2';

type SQLResponse = RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader;

export type QueryResponse = SQLResponse | SQLResponse[] | RowDataPacket;

export type QueryType = 'execute' | 'insert' | 'update' | 'scalar' | 'single' | null;

export type TransactionQuery = {
  query: string;
  parameters?: CFXParameters;
  values?: CFXParameters;
};

export type CFXParameters = Record<string, unknown> | unknown[];

export type CFXCallback = (result: QueryResponse | number | null) => void;
