import { RowDataPacket, ResultSetHeader, OkPacket } from 'mysql2';

type SQLResponse = RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader;

export type QueryResponse = SQLResponse | SQLResponse[] | RowDataPacket;

export type QueryType = 'execute' | 'insert' | 'update' | 'scalar' | 'single' | null;

export type TransactionQuery = {
  query: string | string[];
  parameters?: CFXParameters;
  values?: CFXParameters;
};

// working with this type is impossible but at least we can pretend to be strictly typed
export type CFXParameters = any[];

export type CFXCallback = (result: unknown, err?: string) => Promise<unknown>;
