/// <reference path="node_modules\@citizenfx\server\index.d.ts" />
const { createPool, format, escape } = require("mysql2/promise");
const { ConnectionStringParser } = require("connection-string-parser");

const connectionString = GetConvar("mysql_connection_string", "");

if (connectionString === "") throw new Error(`Set up mysql_connection_string in server.cfg`);

const connectionStringParser = new ConnectionStringParser({
  scheme: "mysql",
  hosts: [],
});

const config = connectionStringParser.parse(connectionString);

if (Object.keys(config).length === 0)
  throw new Error(
    `Set up mysql_connection_string in correct format - 'mysql://user:password@host/database'`
  );

const slowQueryWarning = GetConvarInt("mysql_slow_query_warning", 100);

const debug = GetConvar("mysql_debug", "false") === "true";

const pool = createPool({
  host: config.hosts[0].host,
  user: config.username,
  password: config.password,
  database: config.endpoint,
  charset: "utf8mb4_unicode_ci",
  namedPlaceholders: true,
  ...config.options,
});

pool
  .getConnection()
  .then(() => {
    console.info("Database server connection established.");
  })
  .catch((error) => {
    console.error(error.message);
  });

const formatQuery = (query, params) => {
  if (!Array.isArray(params)) {
    query = query.replace(/@(\w+)/g, (raw, match) => `:${match}`);

    let newParams = {};
    Object.keys(params).forEach((param) => {
      newParams[param.replace("@", "")] = params[param];
    });

    params = newParams;
  }

  return [query, params];
};

const execute = async (query, parameters) => {
  ScheduleResourceTick(GetCurrentResourceName());
  try {
    const [formattedQuery, formattedParameters] = formatQuery(query, parameters);

    const startTime = process.hrtime.bigint();
    const [result] = await pool.execute(formattedQuery, formattedParameters);
    const executionTime = Number(process.hrtime.bigint() - startTime) / 1000000;

    if (executionTime >= slowQueryWarning)
      console.warn(`${formattedQuery} took ${executionTime}ms!`, formattedParameters);
    else if (debug) console.log(`${formattedQuery} took ${executionTime}ms!`, formattedParameters);

    return result;
  } catch (error) {
    if (debug) {
      console.error(query);
      console.error(parameters);
    }
    return console.error(error.message);
  }
};

global.exports("execute", (query, parameters, callback = () => {}) => {
  execute(query, parameters).then(
    (result) => typeof callback === "function" && callback(result && result.affectedRows)
  );
});

global.exports("fetch", (query, parameters, callback = () => {}) => {
  execute(query, parameters).then((result) => typeof callback === "function" && callback(result));
});

global.exports("single", (query, parameters, callback = () => {}) => {
  execute(query, parameters).then(
    (result) => typeof callback === "function" && callback(result && result[0])
  );
});

global.exports("scalar", (query, parameters, callback = () => {}) => {
  execute(query, parameters).then(
    (result) =>
      typeof callback === "function" && callback(result && result[0] && Object.values(result[0])[0])
  );
});

global.exports("insert", (query, parameters, callback = () => {}) => {
  execute(query, parameters).then(
    (result) => typeof callback === "function" && callback(result && result.insertId)
  );
});
