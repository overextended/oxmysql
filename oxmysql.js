/// <reference path="node_modules\@citizenfx\server\index.d.ts" />
const { createPool } = require('mysql2/promise');

const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'database',
    charset: 'utf8mb4_unicode_ci',
    multipleStatements: false,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const execute = async (query, parameters) => {
    ScheduleResourceTick(GetCurrentResourceName());
    try {
        console.time(query);
        const [result] = await pool.execute(query, parameters);
        console.timeEnd(query);
        return result;
    } catch (error) {
        return console.error(error.message);
    }
}

global.exports("execute", (query, parameters, callback = () => { }) => {
    execute(query, parameters).then(result =>
        callback(result && result.affectedRows)
    );
});

global.exports("fetch", (query, parameters, callback = () => { }) => {
    execute(query, parameters).then(result =>
        callback(result)
    );
});

global.exports("single", (query, parameters, callback = () => { }) => {
    execute(query, parameters).then(result =>
        callback(result && result[0])
    );
});

global.exports("scalar", (query, parameters, callback = () => { }) => {
    execute(query, parameters).then(result =>
        callback(result && result[0] && Object.values(result[0])[0])
    );
});

global.exports("insert", (query, parameters, callback = () => { }) => {
    execute(query, parameters).then(result =>
        callback(result && result.insertId)
    );
});
