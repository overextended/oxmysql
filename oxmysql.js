/// <reference path="node_modules\@citizenfx\server\index.d.ts" />
const { createPool } = require('mysql2/promise');
const { ConnectionStringParser } = require('connection-string-parser');

const connectionStringParser = new ConnectionStringParser({
    scheme: 'mysql',
    hosts: []
});

const connectionString = GetConvar('mysql_connection_string', '');

if(connectionString === '') throw new Error(`Undefined convar mysql_connection_string`);

const config = connectionStringParser.parse(connectionString);

//TODO: semicolor format

const slowQueryWarning = GetConvarInt('mysql_slow_query_warning', 100)

const pool = createPool({
    host: config.hosts[0].host,
    user: config.username,
    password: config.password,
    database: config.endpoint,
    charset: 'utf8mb4_unicode_ci',
    multipleStatements: false,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ...config.options
});

/**
 * Check database connection with .ping()
 * until the connection is stablished
 */
let DbReady = false;

async function checkConnection() {
    let conn = await pool.getConnection();
    try {
        await conn.ping(); /* should raise an error if connection is down? */
        DbReady = true;
    }
    catch {
        DbReady = false;
    }
}

let tick = setTick(async () => {
    if (!DbReady)
        await checkConnection();
    else
        clearTick(tick);
});

const execute = async (query, parameters) => {
    ScheduleResourceTick(GetCurrentResourceName());
    try {
        const startTime = process.hrtime.bigint();
        const [result] = await pool.execute(query, parameters);
        const executionTime = new Number((process.hrtime.bigint() - startTime)) / 1000000

        if(executionTime >= slowQueryWarning)
            console.warn(`${query} took ${executionTime}ms!`)
        
        return result;
    } catch (error) {
        /* QUERY LOG ERRORS */
        console.log('Error on query:', query);
        console.log('Params on query:', parameters);
        return console.error(error.message);
    }
}

global.exports("execute", (query, parameters, callback = () => { }) => {
    execute(query, parameters).then(result => {
        if (typeof callback === 'function')
            callback(result && result.affectedRows)
    });
});

global.exports("fetch", (query, parameters, callback = () => { }) => {
    execute(query, parameters).then(result =>
        { if (typeof callback === 'function') callback(result); }
    );
});

global.exports("single", (query, parameters, callback = () => { }) => {
    execute(query, parameters).then(result =>
        { if (typeof callback === 'function')  callback(result && result[0]); }
    );
});

global.exports("scalar", (query, parameters, callback = () => { }) => {
    execute(query, parameters).then(result =>
        { if (typeof callback === 'function') callback(result && result[0] && Object.values(result[0])[0]); }
    );
});

global.exports("insert", (query, parameters, callback = () => { }) => {
    execute(query, parameters).then(result =>
        { if (typeof callback === 'function') callback(result && result.insertId); }
    );
});

global.exports("ready", () => {
    return DbReady
})
