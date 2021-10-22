import { pool } from './pool';
import { execute, preparedStatement } from './execute';
import { transaction } from './transaction';
import { debug, isolationLevel } from './config';

setImmediate(async () => {
  try {
    await pool.query(isolationLevel);
    console.log(`^2Database server connection established!^0`);
  } catch (error) {
    console.log(`^3Unable to establish a connection to the database! [${error.code}]\n${error.message}^0`);
  }
});

const safeCallback = (callback, result, resource, query) => {
  if (typeof callback === 'function')
    return callback(result);
  else if (debug)
    return console.log(`^3[WARNING] ${resource} executed a query, but no callback function was defined!\n        ^3 ${query}^0`);
};

global.exports('execute', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb || parameters, result, resource, query));
});

global.exports('insert', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb || parameters, result && result.insertId, resource, query));
});

global.exports('update', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => 
    safeCallback(cb || parameters, result && result.affectedRows, resource, query));
});

global.exports('fetch', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb || parameters, result, resource, query));
});

global.exports('single', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb || parameters, result && result[0], resource, query));
});

global.exports('scalar', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb || parameters, result && result[0] && Object.values(result[0])[0], resource, query));
});

global.exports('transaction', (queries, parameters, cb, resource = GetInvokingResource()) => {
  transaction(queries, parameters, resource).then((result) => {
    safeCallback(cb || parameters, result || false, resource, debug && JSON.stringify(queries));
  });
});

global.exports('prepared', (query, parameters, cb, resource = GetInvokingResource()) => {
  preparedStatement(query, parameters, resource).then((result) =>
    safeCallback(cb || parameters, result, resource, query))
});

if (!GetResourceMetadata(GetCurrentResourceName(), 'server_script', 1)) {
  global.exports('preparedSync', async (query, parameters) => {
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