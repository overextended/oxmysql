/// <reference path="node_modules\@citizenfx\server\index.d.ts" />
const { createPool } = require("mysql2/promise");
const { ConnectionStringParser } = require("connection-string-parser");

const connectionString = GetConvar("mysql_connection_string", "");

if (connectionString === "") throw new Error(`Set up mysql_connection_string in server.cfg`);

const config = new ConnectionStringParser({
  scheme: "mysql",
  hosts: [],
}).parse(connectionString);

if (Object.keys(config).length === 0)
  throw new Error(
    `Set up mysql_connection_string in correct format - 'mysql://user:password@host/database'`
  );

const slowQueryWarning = GetConvarInt("mysql_slow_query_warning", 100);
const debug = GetConvar("mysql_debug", "false") === "true";
const resourceName = GetCurrentResourceName() || "oxmysql";

const pool = createPool({
  host: config.hosts[0].host,
  user: config.username,
  password: config.password,
  database: config.endpoint,
  charset: "utf8mb4_unicode_ci",
  ...config.options,
  namedPlaceholders: true,
  typeCast: (field, next) => {
    if (field.type === "TINY" && field.length === 1) {
      return field.string() === "1";
    } else if (field.type === "BIT") {
      return field.buffer()[0] === 1;
    } else if (field.type === "TIMESTAMP" || field.type === "DATETIME") {
      return new Date(field.string()).getTime() / 1000;
    } else {
      return next();
    }
  },
});

pool
  .getConnection()
  .then(() => {
    console.log('^2Database server connection established^0');
  })
  .catch((error) => {
    console.error(error.message);
  });

const execute = async (query, parameters, prepare = true, resource) => {
  ScheduleResourceTick(resourceName);
  try {
    const time = new Date()

    // FIX WHEN SENDING LUA {nil, something, nil} => [null, something, null] based on count of ? in query
    // Named placeholders handles this in patch {var1 = nil, var2 = something} => { var1: null, var2: something }
    if (Array.isArray(parameters) && query.includes("?")) {
      const requiredParameters = query.match(/\?/g);
      if (requiredParameters.length !== parameters.length)
        requiredParameters.forEach((_, index) => (parameters[index] = parameters[index] || null));
    }

    const [result] = prepare
      ? await pool.execute(query, parameters)
      : await pool.query(query, parameters);

    const executionTime = new Date()-time;

    if (executionTime >= slowQueryWarning)
      console.warn(`${resource} took ${executionTime}ms to execute a query!\n^3${query}`,parameters);
    else (debug)
      console.log(`^3${resource} took ${executionTime}ms to execute a query!\n^3${query},${parameters}^0`);
      
    return result;
  } catch (error) {
    console.log(`^1${resource} was unable to execute a query: ${error.message}!\n^1${error.sql}`,parameters,'^0')
  }
};

global.exports("execute", (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
  execute(query, parameters, false, resource).then(
    (result) => typeof callback === "function" && callback(result || false)
  );
});

global.exports("insert", (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
  execute(query, parameters, false, resource).then(
    (result) => typeof callback === "function" && callback((result && result.insertId) || false)
  );
});

global.exports("fetch", (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
  execute(query, parameters, true, resource).then(
    (result) => typeof callback === "function" && callback(result || false)
  );
});

global.exports("single", (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
  execute(query, parameters, true, resource).then(
    (result) => typeof callback === "function" && callback((result && result[0]) || false)
  );
});

global.exports("scalar", (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
  execute(query, parameters, true, resource).then(
    (result) => typeof callback === "function" && callback((result && result[0] && Object.values(result[0])[0]) || false)
  );
});

/*
global.exports("executeSync", async(query, parameters) => {
  const result = await execute(query, parameters, true, GetInvokingResource())
  return result || false
});

global.exports("insertSync", async(query, parameters) => {
  const result = await execute(query, parameters, true, GetInvokingResource())
  return result && result.insertId || false
});

global.exports("fetchSync", async(query, parameters) => {
  const result = await execute(query, parameters, true, GetInvokingResource())
  return result || false
});

global.exports("singleSync", async(query, parameters) => {
  const result = await execute(query, parameters, true, GetInvokingResource())
  return result && result[0] || false
});

global.exports("scalarSync", async(query, parameters) => {
  const result = await execute(query, parameters, true, GetInvokingResource())
  return result && result[0] && Object.values(result[0])[0] || false
});
*/