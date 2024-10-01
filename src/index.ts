import type { CFXCallback, CFXParameters, TransactionQuery } from './types';
import { rawQuery, rawExecute, rawTransaction, pool } from './database';
import { startTransaction } from 'database/startTransaction';
import { sleep } from 'utils/sleep';
import ghmatti from './compatibility/ghmattimysql';
import mysqlAsync from './compatibility/mysql-async';
import('./update');

const MySQL = {} as Record<string, Function>;

MySQL.isReady = () => {
  return pool ? true : false;
};

MySQL.awaitConnection = async () => {
  while (!pool) await sleep(0);

  return true;
};

MySQL.query = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource(),
  isPromise?: boolean
) => {
  rawQuery(null, invokingResource, query, parameters, cb, isPromise);
};

MySQL.single = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource(),
  isPromise?: boolean
) => {
  rawQuery('single', invokingResource, query, parameters, cb, isPromise);
};

MySQL.scalar = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource(),
  isPromise?: boolean
) => {
  rawQuery('scalar', invokingResource, query, parameters, cb, isPromise);
};

MySQL.update = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource(),
  isPromise?: boolean
) => {
  rawQuery('update', invokingResource, query, parameters, cb, isPromise);
};

MySQL.insert = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource(),
  isPromise?: boolean
) => {
  rawQuery('insert', invokingResource, query, parameters, cb, isPromise);
};

MySQL.transaction = (
  queries: TransactionQuery,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource(),
  isPromise?: boolean
) => {
  rawTransaction(invokingResource, queries, parameters, cb, isPromise);
};

MySQL.startTransaction = (
  transactions: () => Promise<boolean>,
  invokingResource = GetInvokingResource()
) => {
  console.warn(`MySQL.startTransaction is "experimental" and may receive breaking changes.`)
  return startTransaction(invokingResource, transactions, undefined, true);
};

MySQL.prepare = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource(),
  isPromise?: boolean
) => {
  rawExecute(invokingResource, query, parameters, cb, isPromise, true);
};

MySQL.rawExecute = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource(),
  isPromise?: boolean
) => {
  rawExecute(invokingResource, query, parameters, cb, isPromise);
};

// provide the store export for compatibility (ghmatti/mysql-async); simply returns the query as-is
MySQL.store = (query: string, cb: Function) => {
  cb(query);
};

// deprecated export names
MySQL.execute = MySQL.query;
MySQL.fetch = MySQL.query;

function provide(resourceName: string, method: string, cb: Function) {
  on(`__cfx_export_${resourceName}_${method}`, (setCb: Function) => setCb(cb));
}

for (const key in MySQL) {
  const exp = MySQL[key];

  const async_exp = (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) => {
    return new Promise((resolve, reject) => {
      MySQL[key](
        query,
        parameters,
        (result: unknown, err: string) => {
          if (err) return reject(new Error(err));
          resolve(result);
        },
        invokingResource,
        true
      );
    });
  };

  global.exports(key, exp);
  // async_retval
  global.exports(`${key}_async`, async_exp);
  // deprecated aliases for async_retval
  global.exports(`${key}Sync`, async_exp);

  let alias = (ghmatti as any)[key];

  if (alias) {
    provide('ghmattimysql', alias, exp);
    provide('ghmattimysql', `${alias}Sync`, async_exp);
  }

  alias = (mysqlAsync as any)[key];

  if (alias) {
    provide('mysql-async', alias, exp);
  }
}
