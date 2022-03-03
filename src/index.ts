import { CFXCallback, CFXParameters, TransactionQuery } from './types';
import { rawQuery } from './database/rawQuery';
import { rawTransaction } from './database/rawTransaction';
import { rawExecute } from './database/rawExecute';
import('./update');

const MySQL = {} as Record<string, Function>;

MySQL.query = (query: string, parameters: CFXParameters, cb: CFXCallback, invokingResource = GetInvokingResource()) => {
  rawQuery(null, invokingResource, query, parameters, cb);
};

MySQL.query_async = (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
  rawQuery(null, invokingResource, query, parameters);

MySQL.single = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource()
) => {
  rawQuery('single', invokingResource, query, parameters, cb);
};

MySQL.single_async = (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
  rawQuery('single', invokingResource, query, parameters);

MySQL.scalar = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource()
) => {
  rawQuery('scalar', invokingResource, query, parameters, cb);
};

MySQL.scalar_async = (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
  rawQuery('scalar', invokingResource, query, parameters);

MySQL.update = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource()
) => {
  rawQuery('update', invokingResource, query, parameters, cb);
};

MySQL.update_async = (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
  rawQuery('update', invokingResource, query, parameters);

MySQL.insert = (
  query: string,
  parameters: CFXParameters,
  cb: CFXCallback,
  invokingResource = GetInvokingResource()
) => {
  rawQuery('insert', invokingResource, query, parameters, cb);
};

MySQL.insert_async = (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
  rawQuery('insert', invokingResource, query, parameters);

MySQL.transaction = (
  queries: TransactionQuery[] | string[],
  parameters: CFXParameters,
  cb: (result: boolean) => void,
  invokingResource = GetInvokingResource()
) => {
  rawTransaction(invokingResource, queries, parameters, cb);
};

MySQL.transaction_async = (
  queries: TransactionQuery[] | string[],
  parameters: CFXParameters,
  invokingResource = GetInvokingResource()
) => rawTransaction(invokingResource, queries, parameters);

MySQL.prepare = (
  query: string,
  parameters: CFXParameters | CFXParameters[],
  cb: CFXCallback,
  invokingResource = GetInvokingResource()
) => {
  rawExecute(invokingResource, query, parameters, cb);
};

MySQL.prepare_async = (
  query: string,
  parameters: CFXParameters | CFXParameters[],
  invokingResource = GetInvokingResource()
) => rawExecute(invokingResource, query, parameters);

// Continue providing support for exports that were deprecated in v1.9.0 and removed in v2.0.0
// Unfortunately, it's unrealistic to expect people to refer to documentation and update their
// resources accordingly, especially when dealing with the special snowflakes on FiveM who only
// care about squeezing as much money out of the community as possible.
MySQL.execute = MySQL.query;
MySQL.executeSync = MySQL.query_async;
MySQL.fetch = MySQL.query;
MySQL.fetchSync = MySQL.query_async;

for (const key in MySQL) {
  global.exports(key, MySQL[key]);

  if (key.includes('_async')) {
    const alias = `${key.slice(0, -6)}Sync`;
    global.exports(
      alias,
      (query: string, parameters: CFXParameters | CFXParameters[], invokingResource = GetInvokingResource()) => {
        return MySQL[key](query, parameters, invokingResource);
      }
    );
  }
}
