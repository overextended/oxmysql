import { pool } from './pool';
import { execute } from './execute';

setImmediate(async () => {
  try {
    await (await pool.getConnection()).ping();
    console.log(`^2Database server connection established!^0`);
  } catch (error) {
    console.log(`^3Unable to establish a connection to the database! [${error.code}]\n${error.message}^0`);
  }
});

const safeCallback = (callback, result, error) => {
  if (typeof callback === 'function') return callback(result || false);
  else return console.log(`^3[WARNING] ${error[0]} executed a query, but no callback function was defined!\n        ^3 ${error[1]}^0`);
};

global.exports('execute', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb, result, !cb && [resource, query]));
});

global.exports('insert', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb, result && result.insertId, !cb && [resource, query]));
});

global.exports('update', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb, result && result.affectedRows, !cb && [resource, query]));
});

global.exports('fetch', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb, result, !cb && [resource, query]));
});

global.exports('single', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb, result && result[0], !cb && [resource, query]));
});

global.exports('scalar', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb, result && result[0] && Object.values(result[0])[0], !cb && [resource, query]));
});

if (!GetResourceMetadata(GetCurrentResourceName(), 'server_script', 1)) {
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
}