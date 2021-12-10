import { execute, preparedStatement } from './execute';
import { transaction } from './transaction';
import { debug } from './config';

const safeCallback = (callback, result) => {
  if (typeof callback === 'function') callback(result);
};

global.exports('execute', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => safeCallback(cb || parameters, result));
});

global.exports('insert', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => safeCallback(cb || parameters, result && result.insertId));
});

global.exports('update', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => safeCallback(cb || parameters, result && result.affectedRows));
});

global.exports('fetch', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => safeCallback(cb || parameters, result));
});

global.exports('single', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => safeCallback(cb || parameters, result && result[0]));
});

global.exports('scalar', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb || parameters, result && result[0] && Object.values(result[0])[0])
  );
});

global.exports('transaction', (queries, parameters, cb, resource = GetInvokingResource()) => {
  transaction(queries, parameters, resource).then((result) => {
    safeCallback(cb || parameters, result || false, resource, debug && JSON.stringify(queries));
  });
});

global.exports('prepare', (query, parameters, cb, resource = GetInvokingResource()) => {
  preparedStatement(query, parameters, resource).then((result) => safeCallback(cb || parameters, result));
});

if (!GetResourceMetadata(GetCurrentResourceName(), 'server_script', 1)) {
  global.exports('prepareSync', async (query, parameters) => {
    const result = await preparedStatement(query, parameters, GetInvokingResource());
    return result;
  });

  global.exports('executeSync', async (query, parameters) => {
    const result = await execute(query, parameters, GetInvokingResource());
    return result;
  });

  global.exports('insertSync', async (query, parameters) => {
    const result = await execute(query, parameters, GetInvokingResource());
    return result && result.insertId;
  });

  global.exports('updateSync', async (query, parameters) => {
    const result = await execute(query, parameters, GetInvokingResource());
    return result && result.affectedRows;
  });

  global.exports('fetchSync', async (query, parameters) => {
    const result = await execute(query, parameters, GetInvokingResource());
    return result;
  });

  global.exports('singleSync', async (query, parameters) => {
    const result = await execute(query, parameters, GetInvokingResource());
    return result && result[0];
  });

  global.exports('scalarSync', async (query, parameters) => {
    const result = await execute(query, parameters, GetInvokingResource());
    return result && result[0] && Object.values(result[0])[0];
  });

  global.exports('transactionSync', async (queries, parameters) => {
    const result = await transaction(queries, parameters, GetInvokingResource());
    return result;
  });
}