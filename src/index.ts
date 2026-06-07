import type { CFXCallback, CFXParameters, TransactionQuery } from './types';
import { rawQuery, rawExecute, rawTransaction, pool } from './database';
import { startTransaction } from 'database/startTransaction';
import { sleep } from 'utils/sleep';
import ghmatti from './compatibility/ghmattimysql';
import mysqlAsync from './compatibility/mysql-async';
import('./update');

const MySQL = {
  isReady: () => {
    return pool ? true : false;
  },

  awaitConnection: async () => {
    while (!pool) await sleep(0);

    return true;
  },

  query: (
    query: string,
    parameters: CFXParameters = [],
    cb: CFXCallback,
    invokingResource = GetInvokingResource(),
    isPromise?: boolean,
  ) => {
    rawQuery(null, invokingResource, query, parameters, cb, isPromise);
  },

  single: (
    query: string,
    parameters: CFXParameters = [],
    cb: CFXCallback,
    invokingResource = GetInvokingResource(),
    isPromise?: boolean,
  ) => {
    rawQuery('single', invokingResource, query, parameters, cb, isPromise);
  },

  scalar: (
    query: string,
    parameters: CFXParameters = [],
    cb: CFXCallback,
    invokingResource = GetInvokingResource(),
    isPromise?: boolean,
  ) => {
    rawQuery('scalar', invokingResource, query, parameters, cb, isPromise);
  },

  update: (
    query: string,
    parameters: CFXParameters = [],
    cb: CFXCallback,
    invokingResource = GetInvokingResource(),
    isPromise?: boolean,
  ) => {
    rawQuery('update', invokingResource, query, parameters, cb, isPromise);
  },

  insert: (
    query: string,
    parameters: CFXParameters = [],
    cb: CFXCallback,
    invokingResource = GetInvokingResource(),
    isPromise?: boolean,
  ) => {
    rawQuery('insert', invokingResource, query, parameters, cb, isPromise);
  },

  transaction: (
    queries: TransactionQuery,
    parameters: CFXParameters = [],
    cb: CFXCallback,
    invokingResource = GetInvokingResource(),
    isPromise?: boolean,
  ) => {
    rawTransaction(invokingResource, queries, parameters, cb, isPromise);
  },

  startTransaction: (transactions: () => Promise<boolean>, invokingResource = GetInvokingResource()) => {
    console.warn(`startTransaction is "experimental" and may receive breaking changes.`);
    return startTransaction(invokingResource, transactions, undefined, true);
  },

  prepare: (
    query: string,
    parameters: CFXParameters = [],
    cb: CFXCallback,
    invokingResource = GetInvokingResource(),
    isPromise?: boolean,
  ) => {
    rawExecute(invokingResource, query, parameters, cb, isPromise, true);
  },

  rawExecute: (
    query: string,
    parameters: CFXParameters = [],
    cb: CFXCallback,
    invokingResource = GetInvokingResource(),
    isPromise?: boolean,
  ) => {
    rawExecute(invokingResource, query, parameters, cb, isPromise);
  },

  // provide the store export for compatibility (ghmatti/mysql-async); simply returns the query as-is
  store: (query: string, cb: Function) => {
    cb(query);
  },
};

// @ts-expect-error deprecated export
MySQL.execute = MySQL.query;
// @ts-expect-error deprecated export
MySQL.fetch = MySQL.query;

function provide(resourceName: string, method: string, cb: Function) {
  on(`__cfx_export_${resourceName}_${method}`, (setCb: Function) => setCb(cb));
}

const exports = global.exports;

for (const key in MySQL) {
  const exp = (MySQL as any)[key];

  const async_exp = (query: string, parameters: CFXParameters = [], invokingResource = GetInvokingResource()) => {
    return new Promise((resolve, reject) => {
      exp(
        query,
        parameters,
        (result: unknown, err: string) => {
          if (err) return reject(new Error(err));
          resolve(result);
        },
        invokingResource,
        true,
      );
    });
  };

  try {
    exports(key, exp);
    // async_retval
    exports(`${key}_async`, async_exp);
    // deprecated aliases for async_retval
    exports(`${key}Sync`, async_exp);

    let alias = (ghmatti as any)[key];

    if (alias) {
      provide('ghmattimysql', alias, exp);
      provide('ghmattimysql', `${alias}Sync`, async_exp);
    }

    alias = (mysqlAsync as any)[key];

    if (alias) {
      provide('mysql-async', alias, exp);
    }
  } catch {}
}

export default MySQL;
