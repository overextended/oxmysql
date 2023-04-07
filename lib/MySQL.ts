type Query = string | number;
type Params = Record<string, unknown> | unknown[] | Function;
type Callback<T> = (result: T | null) => void;

type Transaction = Object[]

interface Result {
    [column: string | number]: any;
    affectedRows?: number;
    fieldCount?: number;
    info?: string;
    insertId?: number;
    serverStatus?: number;
    warningStatus?: number;
    changedRows?: number;
}

interface Row {
    [column: string | number]: unknown;
}

interface OxMySQL {
  store: (query: string) => void;
  ready: (callback: () => void) => void;
  query: <T = Result | null> (query: Query, params?: Params | Callback<T>, cb?: Callback<T>) => Promise<T>
  single: <T = Row | null> (query: Query, params?: Params | Callback<Exclude<T, []>>, cb?: Callback<Exclude<T, []>>) => Promise<Exclude<T, []>>
  scalar: <T = unknown | null> (query: Query, params?: Params | Callback<Exclude<T, []>>, cb?: Callback<Exclude<T, []>>) => Promise<Exclude<T, []>>
  update: <T = number | null> (query: Query, params?: Params | Callback<T>, cb?: Callback<T>) => Promise<T>
  insert: <T = number | null> (query: Query, params?: Params | Callback<T>, cb?: Callback<T>) => Promise<T>
  prepare: <T = any> (query: Query, params?: Params | Callback<T>, cb?: Callback<T>) => Promise<T>
  transaction: (query: Transaction, params?: Params | Callback<boolean>, cb?: Callback<boolean>) => Promise<boolean>
}

const QueryStore: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) throw new TypeError(message);
}

const safeArgs = (
  query: Query | Transaction,
  params?: any,
  cb?: Function,
  transaction?: true
) => {
  if (typeof query === "number") query = QueryStore[query];

  if (transaction) {
    assert(
      typeof query === "object",
      `First argument expected object, recieved ${typeof query}`
    );
  } else {
    assert(
      typeof query === "string",
      `First argument expected string, received ${typeof query}`
    );
  }

  if (params) {
    const paramType = typeof params;
    assert(
      paramType === "object" || paramType === "function",
      `Second argument expected object or function, received ${paramType}`
    );

    if (!cb && paramType === "function") {
        cb = params
        params = undefined
    }
  }

  if (cb !== undefined)
    assert(
      typeof cb === "function",
      `Third argument expected function, received ${typeof cb}`
    );

  return [query, params, cb];
};

const exp = global.exports.oxmysql;
const currentResourceName = GetCurrentResourceName()

function execute(method: string, query: Query | Transaction, params?: Params) {
    return new Promise((resolve, reject) => {
        exp[method](query, params, (result, error) => {
            if (error) return reject(error)
            resolve(result)
        }, currentResourceName, true)
    }) as any
}

export const oxmysql: OxMySQL = {
  store(query) {
    assert(
      typeof query !== "string",
      `Query expects a string, received ${typeof query}`
    );

    return QueryStore.push(query);
  },
  ready(callback) {
    setImmediate(async () => {
      while (GetResourceState("oxmysql") !== "started")
        await new Promise((resolve) => setTimeout(resolve, 50));
      callback();
    });
  },
  async query(query, params, cb) {
    [query, params, cb] = safeArgs(query, params, cb)
    const result = await execute('query', query, params)
    return cb ? cb(result) : result
  },
  async single(query, params, cb) {
    [query, params, cb] = safeArgs(query, params, cb)
    const result = await execute('single', query, params)
    return cb ? cb(result) : result
  },
  async scalar(query, params, cb) {
    [query, params, cb] = safeArgs(query, params, cb)
    const result = await execute('scalar', query, params)
    return cb ? cb(result) : result
  },
  async update(query, params, cb) {
    [query, params, cb] = safeArgs(query, params, cb)
    const result = await execute('update', query, params)
    return cb ? cb(result) : result
  },
  async insert(query, params, cb) {
    [query, params, cb] = safeArgs(query, params, cb)
    const result = await execute('insert', query, params)
    return cb ? cb(result) : result
  },
  async prepare(query, params, cb) {
    [query, params, cb] = safeArgs(query, params, cb)
    const result = await execute('prepare', query, params)
    return cb ? cb(result) : result
  },
  async transaction(query, params, cb) {
    [query, params, cb] = safeArgs(query, params, cb, true)
    const result = await execute('transaction', query, params)
    return cb ? cb(result) : result
  },
};
