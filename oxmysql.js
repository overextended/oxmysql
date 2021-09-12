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
    console.info("Database server connection established.");
  })
  .catch((error) => {
    console.error(error.message);
  });

const execute = async (query, parameters, prepare = true) => {
  ScheduleResourceTick(resourceName);
  try {
    const startTime = process.hrtime.bigint();

    const [result] = prepare
      ? await pool.execute(query, parameters)
      : await pool.query(query, parameters);

    const executionTime = Number(process.hrtime.bigint() - startTime) / 1e6;

    if (executionTime >= slowQueryWarning || debug)
      console.warn(`${query} took ${executionTime}ms!`, parameters);

    return result;
  } catch (error) {
    console.error(error.message, debug && query, debug && parameters);
    return false;
  }
};

global.exports("execute", (query, parameters, callback = () => {}) => {
  execute(query, parameters, false).then(
    (result) => typeof callback === "function" && callback(result || false)
  );
});

global.exports("insert", (query, parameters, callback = () => {}) => {
  execute(query, parameters, false).then(
    (result) => typeof callback === "function" && callback((result && result.insertId) || false)
  );
});

global.exports("fetch", (query, parameters, callback = () => {}) => {
  execute(query, parameters).then(
    (result) => typeof callback === "function" && callback(result || false)
  );
});

global.exports("single", (query, parameters, callback = () => {}) => {
  execute(query, parameters).then(
    (result) => typeof callback === "function" && callback((result && result[0]) || false)
  );
});

global.exports("scalar", (query, parameters, callback = () => {}) => {
  execute(query, parameters).then(
    (result) =>
      typeof callback === "function" &&
      callback((result && result[0] && Object.values(result[0])[0]) || false)
  );
});
