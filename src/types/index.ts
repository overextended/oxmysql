export type QueryResponse =
  | Record<string, any>
  | Record<string, any>[]
  | Record<string, any>[][];

export type QueryType = 'execute' | 'insert' | 'update' | 'scalar' | 'single' | null;

export type TransactionQuery = {
  query: string | string[];
  parameters?: CFXParameters;
  values?: CFXParameters;
};

export type CFXParameters = any[];
export type CFXCallback = (result: unknown, err?: string) => void;
