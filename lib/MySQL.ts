type Query = string | number;
type Params = Record<string, unknown> | unknown[];
type Callback<T> = (result: T | null) => void;

type Transaction = {
  query: Query;
} & ({ params?: Params } | { values?: Params });

interface OxMySQL {
  store: (query: string) => void;
  ready: (callback: () => void) => void;
  query:
    | (<T = any>(query: Query, params?: Params, cb?: Callback<T>) => Promise<T | null>)
    | (<T = any>(query: Query, params?: Params, cb?: Callback<T>) => void)
    | (<T = any>(query: Query, params?: Params, cb?: Callback<T>) => Promise<T | null> | void);
  single:
    | (<T = Record<string | number, any>>(query: Query, params?: Params) => Promise<T | null>)
    | (<T = Record<string | number, any>>(query: Query, params?: Params, cb?: Callback<T>) => void)
    | (<T = Record<string | number, any>>(query: Query, params?: Params, cb?: Callback<T>) => Promise<T | null | void>);
  scalar:
    | (<T = unknown>(query: Query, params?: Params) => Promise<T | null>)
    | (<T = unknown>(query: Query, params?: Params, cb?: Callback<T>) => void)
    | (<T = unknown>(query: Query, params?: Params, cb?: Callback<T>) => Promise<T | null> | void);
  update:
    | ((query: Query, params?: Params) => Promise<number | null>)
    | ((query: Query, params?: Params, cb?: Callback<number>) => void)
    | ((query: Query, params?: Params, cb?: Callback<number>) => Promise<number | null> | void);
  insert:
    | ((query: Query, params?: Params) => Promise<number | null>)
    | ((query: Query, params?: Params, cb?: Callback<number>) => void)
    | ((query: Query, params?: Params, cb?: Callback<number>) => Promise<number | null> | void);
  prepare:
    | (<T = unknown>(query: Query, params?: Params) => Promise<T | null>)
    | (<T = unknown>(query: Query, params?: Params, cb?: Callback<T>) => void)
    | (<T = unknown>(query: Query, params?: Params, cb?: Callback<T>) => Promise<T | null> | void);
  transaction:
    | ((query: Query, params?: Params) => Promise<boolean>)
    | ((query: Query, params?: Params, cb?: Callback<boolean>) => void)
    | ((query: Query, params?: Params, cb?: Callback<boolean>) => Promise<boolean> | void);
}

const QueryStore: string[] = [];

const Wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const assert = (condition: boolean, message: string) => {
  if (!condition) throw new TypeError(message);
};

const safeArgs = (query: Transaction[] | string[] | Query, params?: any, cb?: Callback<any>, transaction?: true) => {
  if (typeof query === 'number') query = QueryStore[query];

  if (transaction) {
    assert(Array.isArray(query), `First argument expected array, recieved ${typeof query}`);
  } else {
    assert(typeof query === 'string', `First argument expected string, received ${typeof query}`);
  }

  if (params) {
    const paramType = typeof params;
    assert(
      paramType === 'object' || paramType === 'function',
      `Second argument expected table or function, received ${paramType}`
    );
  }

  if (cb !== undefined) assert(typeof cb === 'function', `Callback expects function, received ${typeof cb}`);

  return [query, params, cb];
};

export const oxmysql: OxMySQL = {
  store(query) {
    assert(typeof query !== 'string', `Query expects a string, received ${typeof query}`);

    return QueryStore.push(query);
  },
  ready(callback) {
    setImmediate(() => {
      while (GetResourceState('oxmysql') !== 'started') Wait(50);
      callback();
    });
  },
  query(query, params, cb) {
    if (cb) return global.exports.oxmysql.query(...safeArgs(query, params, cb));
    return global.exports.oxmysql.query_async(...safeArgs(query, params));
  },
  single(query, params, cb) {
    if (cb) return global.exports.oxmysql.single(...safeArgs(query, params, cb));
    return global.exports.oxmysql.single_async(...safeArgs(query, params));
  },
  scalar(query, params, cb) {
    if (cb) return global.exports.oxmysql.scalar(...safeArgs(query, params, cb));
    return global.exports.oxmysql.scalar_async(...safeArgs(query, params));
  },
  update(query, params, cb) {
    if (cb) return global.exports.oxmysql.update(...safeArgs(query, params, cb));
    return global.exports.oxmysql.update_async(...safeArgs(query, params));
  },
  insert(query, params, cb) {
    if (cb) return global.exports.oxmysql.insert(...safeArgs(query, params, cb));
    return global.exports.oxmysql.insert_async(...safeArgs(query, params));
  },
  prepare(query, params, cb) {
    if (cb) return global.exports.oxmysql.prepare(...safeArgs(query, params, cb));
    return global.exports.oxmysql.prepare_async(...safeArgs(query, params));
  },
  transaction(query, params, cb) {
    if (cb) return global.exports.oxmysql.transaction(...safeArgs(query, params, cb, true));
    return global.exports.oxmysql.transaction_async(...safeArgs(query, params, undefined, true));
  },
};
