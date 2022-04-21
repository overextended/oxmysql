import { CFXCallback, CFXParameters, TransactionQuery } from './types';
import { rawQuery } from './database/rawQuery';
import { rawTransaction } from './database/rawTransaction';
import { rawExecute } from './database/rawExecute';
import('./update');

const MySQL = {} as Record<string, Function>;

MySQL.query = (query: string, parameters: CFXParameters, cb: CFXCallback, invokingResource = GetInvokingResource()) => {
  rawQuery(null, invokingResource, query, parameters, cb);
};

MySQL.single = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource()
) => {
  rawQuery('single', invokingResource, query, parameters, cb);
};

MySQL.scalar = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource()
) => {
  rawQuery('scalar', invokingResource, query, parameters, cb);
};

MySQL.update = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource()
) => {
  rawQuery('update', invokingResource, query, parameters, cb);
};

MySQL.insert = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource()
) => {
  rawQuery('insert', invokingResource, query, parameters, cb);
};

MySQL.transaction = (
  queries: TransactionQuery,
  parameters: CFXParameters,
  cb: (result: boolean) => void,
  invokingResource = GetInvokingResource()
) => {
  rawTransaction(invokingResource, queries, parameters, cb);
};

MySQL.prepare = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource()
) => {
  rawExecute(invokingResource, query, parameters, cb);
};

MySQL.execute = MySQL.query;
MySQL.fetch = MySQL.query;

for (const key in MySQL) {
  global.exports(key, MySQL[key]);

  const exp = (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) => {
    return new Promise((resolve) => {
      MySQL[key](query, parameters, resolve, invokingResource);
    });
  };

  global.exports(`${key}_async`, exp);
  global.exports(`${key}Sync`, exp);
}
