import { pool } from './pool';
import { execute } from './execute';
setImmediate(async () => {
  try {
    await (await pool.getConnection()).ping();
    console.log(`^2Database server connection established!^0`);
  } catch (error) {
    console.log(`^3Databae server connection establishing error! [${error.code}]\n${error.message}^0`);
  }
});

const safeCallback = (callback, result) => {
  if (typeof callback === 'function') return callback(result || false);
  else throw new Error(`Undefined callback passed`);
};

global.exports('execute', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => safeCallback(cb, result));
});

global.exports('insert', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => safeCallback(cb, result && result.insertId));
});

global.exports('update', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => safeCallback(cb, result && result.affectedRows));
});

global.exports('fetch', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => safeCallback(cb, result));
});

global.exports('single', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) => safeCallback(cb, result && result[0]));
});

global.exports('scalar', (query, parameters, cb, resource = GetInvokingResource()) => {
  execute(query, parameters, resource).then((result) =>
    safeCallback(cb, result && result[0] && Object.values(result[0])[0])
  );
});

/*global.exports('executeSync', async (query, parameters) => {
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
});*/
