import { CFXCallback, CFXParameters, TransactionQuery } from './types';
import { rawQuery } from './database/rawQuery';
import { rawTransaction } from './database/rawTransaction';
import { rawExecute } from './database/rawExecute';

//TODO
import('./update');

global.exports('query', (query: string, parameters: CFXParameters, cb: CFXCallback, invokingResource = GetInvokingResource()) => {
  rawQuery(null, invokingResource, query, parameters, cb);
});

global.exports('query_async', (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
  rawQuery(null, invokingResource, query, parameters)
);

global.exports('single', (query: string, parameters: CFXParameters, cb: CFXCallback, invokingResource = GetInvokingResource()) => {
  rawQuery('single', invokingResource, query, parameters, cb);
});

global.exports('single_async', (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
  rawQuery('single', invokingResource, query, parameters)
);

global.exports('scalar', (query: string, parameters: CFXParameters, cb: CFXCallback, invokingResource = GetInvokingResource()) => {
  rawQuery('scalar', invokingResource, query, parameters, cb);
});

global.exports('scalar_async', (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
  rawQuery('scalar', invokingResource, query, parameters)
);

global.exports('update', (query: string, parameters: CFXParameters, cb: CFXCallback, invokingResource = GetInvokingResource()) => {
  rawQuery('update', invokingResource, query, parameters, cb);
});

global.exports('update_async', (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
  rawQuery('update', invokingResource, query, parameters)
);

global.exports('insert', (query: string, parameters: CFXParameters, cb: CFXCallback, invokingResource = GetInvokingResource()) => {
  rawQuery('insert', invokingResource, query, parameters, cb);
});

global.exports('insert_async', (query: string, parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
  rawQuery('insert', invokingResource, query, parameters)
);

global.exports(
  'transaction',
  (
    queries: TransactionQuery[] | string[],
    parameters: CFXParameters,
    cb: (result: boolean) => void,
    invokingResource = GetInvokingResource()
  ) => {
    rawTransaction(invokingResource, queries, parameters, cb);
  }
);

global.exports(
  'transaction_async',
  (queries: TransactionQuery[] | string[], parameters: CFXParameters, invokingResource = GetInvokingResource()) =>
    rawTransaction(invokingResource, queries, parameters)
);

global.exports(
  'prepare',
  (query: string, parameters: CFXParameters | CFXParameters[], cb: CFXCallback, invokingResource = GetInvokingResource()) => {
    rawExecute(invokingResource, query, parameters, cb);
  }
);

global.exports('prepare_async', (query: string, parameters: CFXParameters | CFXParameters[], invokingResource = GetInvokingResource()) =>
  rawExecute(invokingResource, query, parameters)
);
