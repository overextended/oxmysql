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

const pool = createPool({
  host: config.hosts[0].host || "localhost",
  user: config.username || "root",
  password: config.password || "",
  database: config.endpoint || "es_extended",
  charset: "utf8mb4_unicode_ci",
  ...config.options,
  namedPlaceholders: true,
  typeCast: (field, next) => {
    //https://github.com/GHMatti/ghmattimysql/blob/37f1d2ae5c53f91782d168fe81fba80512d3c46d/packages/ghmattimysql/src/server/utility/typeCast.ts#L3
    switch (field.type) {
      case "DATETIME":
      case "DATETIME2":
      case "TIMESTAMP":
      case "TIMESTAMP2":
      case "NEWDATE":
      case "DATE":
        return field.type === "DATE"
          ? new Date(field.string() + " 00:00:00").getTime()
          : new Date(field.string()).getTime();
      case "TINY":
        if (field.length === 1) return field.string() === "1";
        else return next();
      case "BIT":
        return field.buffer()[0] === 1;
      default:
        return next();
    }
  },
});

pool
  .getConnection()
  .then(() => {
    console.log("^2Database server connection established^0");
  })
  .catch((error) => {
    console.error(error.message);
  });

const resourceName = GetCurrentResourceName() || "oxmysql";

const parseParameters = (query, parameters) => {
  if (query.includes("@") || query.includes(":")) {
    if (parameters === undefined)
      throw new Error(`@ or : was defined in query but no parameters provided!`);
    if (Array.isArray(parameters)) return {};
  }
  if (!query.includes("?")) return parameters;
  if (parameters === undefined)
    throw new Error(`? was defined in query but no parameters provided!`);

  const parametersCount = query.match(/\?(?!\?)/g).length;

  if (Array.isArray(parameters)) {
    for (let i = parameters.length; i < parametersCount; i++) {
      console.warn(`Parameter #${i + 1} has NULL value (Sending nil from lua?)`, query, parameters);
      parameters.push(null);
    }
    return parameters;
  } else {
    let arr = [];
    for (let i = 0; i < parametersCount; i++) {
      arr.push(parameters[`${i + 1}`] || null);
      if (!parameters[`${i + 1}`])
        console.warn(
          `Parameter #${i + 1} has NULL value (Sending nil from lua?)`,
          query,
          parameters
        );
    }
    return arr;
  }
};

const execute = async (query, parameters, resource, prepare = true) => {
  ScheduleResourceTick(resourceName);
  try {
    if (!query)
      throw new Error(
        `Undefined query was passed. Make sure you use exports in format 'exports.oxmysql: ' and not 'exports.oxmysql. '`
      );

    const time = process.hrtime.bigint();

    parameters = parseParameters(query, parameters);

    const [result] = prepare
      ? await pool.execute(query, parameters)
      : await pool.query(query, parameters);

    const executionTime = Number(process.hrtime.bigint() - time) / 1e6;

    if (executionTime >= slowQueryWarning)
      console.warn(
        `${resource} took ${executionTime}ms to execute a query!\n^3${query}`,
        parameters
      );
    else if (debug)
      console.log(
        `^3${resource} took ${executionTime}ms to execute a query!\n^3${query},${parameters}^0`
      );

    return result;
  } catch (error) {
    console.log(
      `^1${resource} was unable to execute a query: ${error.message}!\n^1${error.sql}`,
      parameters,
      "^0"
    );
  }
};

global.exports(
  "execute",
  (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
    execute(query, parameters, resource, false).then(
      (result) => typeof callback === "function" && callback(result || false)
    );
  }
);

global.exports(
  "insert",
  (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
    execute(query, parameters, resource).then(
      (result) => typeof callback === "function" && callback((result && result.insertId) || false)
    );
  }
);

global.exports(
  "update",
  (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
    execute(query, parameters, resource).then(
      (result) => typeof callback === "function" && callback((result && result.affectedRows) || 0)
    );
  }
);

global.exports(
  "fetch",
  (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
    execute(query, parameters, resource).then(
      (result) => typeof callback === "function" && callback(result || false)
    );
  }
);

global.exports(
  "single",
  (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
    execute(query, parameters, resource).then(
      (result) => typeof callback === "function" && callback((result && result[0]) || false)
    );
  }
);

global.exports(
  "scalar",
  (query, parameters, callback = () => {}, resource = GetInvokingResource()) => {
    execute(query, parameters, resource).then(
      (result) =>
        typeof callback === "function" &&
        callback((result && result[0] && Object.values(result[0])[0]) || false)
    );
  }
);

/*
global.exports("executeSync", async(query, parameters) => {
  const result = await execute(query, parameters, GetInvokingResource(), false)
  return result || false
});

global.exports("insertSync", async(query, parameters) => {
  const result = await execute(query, parameters, GetInvokingResource())
  return result && result.insertId || false
});

global.exports("updateSync", async(query, parameters) => {
  const result = await execute(query, parameters, GetInvokingResource())
  return result && result.affectedRows || 0
});

global.exports("fetchSync", async(query, parameters) => {
  const result = await execute(query, parameters, GetInvokingResource())
  return result || false
});

global.exports("singleSync", async(query, parameters) => {
  const result = await execute(query, parameters, GetInvokingResource())
  return result && result[0] || false
});

global.exports("scalarSync", async(query, parameters) => {
  const result = await execute(query, parameters, GetInvokingResource())
  return result && result[0] && Object.values(result[0])[0] || false
});
*/
