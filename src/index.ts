import type { CFXCallback, CFXParameters, TransactionQuery } from './types';
import { rawQuery, rawExecute, rawTransaction, isServerConnected, waitForConnection } from './database';
import('./update');

const MySQL = {} as Record<string, Function>;

MySQL.isReady = () => {
  return isServerConnected;
};

MySQL.awaitConnection = async () => {
  await waitForConnection();
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

MySQL.execute = MySQL.query;
MySQL.fetch = MySQL.query;

function provide(name: string, cb: Function, sync: Function) {
  on(`__cfx_export_ghmattimysql_${name}`, (setCb: Function) => setCb(cb));
  on(`__cfx_export_ghmattimysql_${name}Sync`, (setCb: Function) => setCb(sync));
}

// provide the "store" and "storeSync" exports, to provide compatibility for ghmattimysql
// these are not actually used to do anything, simply returning the query as-is
provide(
  'store',
  (query: string, cb: Function) => {
    cb(query);
  },
  (query: string) => {
    return query;
  }
);

for (const key in MySQL) {
  global.exports(key, MySQL[key]);

  const exp = (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) => {
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

  global.exports(`${key}_async`, exp);
  global.exports(`${key}Sync`, exp);

  if (key === 'execute' || key === 'scalar' || key === 'transaction') provide(key, MySQL[key], exp);
}
