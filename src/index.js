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

global.exports('execute', (query, parameters, cb, prepare = true, resource = GetInvokingResource()) => {
  execute(query, parameters, resource, prepare).then((result) => {
    // Unsuccesful query
    if (!result) return safeCallback(cb, false);

    // Insert query
    if (result.insertId) return safeCallback(cb, result.insertId);

    // Update query
    if (result.affectedRows) return safeCallback(cb, result.affectedRows);

    if (result.length && result.length === 1) {
      const values = Object.values(result[0]);
      // Single query
      if (values.length === 1) return safeCallback(cb, values[0]);

      // Scalar query
      return safeCallback(cb, result[0]);
    }

    // Fetch
    return safeCallback(cb, result);
  });
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

/*global.exports('executeSync', async (query, parameters, prepare = true) => {
  const result = await execute(query, parameters, GetInvokingResource(), prepare);

  // Unsuccesful query
  if (!result) return false;

  // Insert query
  if (result.insertId) return result.insertId;

  // Update query
  if (result.affectedRows) return result.affectedRows;

  if (result.length && result.length === 1) {
    const values = Object.values(result[0]);
    // Single query
    if (values.length === 1) return values[0];

    // Scalar query
    return result[0];
  }

  // Fetch
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
