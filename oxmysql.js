/// <reference path="node_modules\@citizenfx\server\index.d.ts" />
const { createPool } = require('mysql2/promise');

const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'database',
    charset: 'utf8mb4',
    multipleStatements: true,
    namedPlaceholders: true,
    waitForConnections: true,
});

const execute = async (query, parameters) => {
    try {
        console.time(query);
        const [result] = await pool.execute(query, parameters);
        console.timeEnd(query);

        return result;
    } catch (error) {
        console.error(error.message);

        return;
    }
}

global.exports("execute", (query, parameters = [], callback = () => { }) => {
    ScheduleResourceTick(GetCurrentResourceName());
    execute(query, parameters)
        .then(result => callback(result && result.affectedRows));
});

global.exports("fetch", (query, parameters = [], callback = () => { }) => {
    ScheduleResourceTick(GetCurrentResourceName());
    execute(query, parameters)
        .then(result => callback(result));
});

global.exports("single", (query, parameters = [], callback = () => { }) => {
    ScheduleResourceTick(GetCurrentResourceName());
    execute(query, parameters)
        .then(result => callback(result && result[0]));
});

global.exports("scalar", (query, parameters = [], callback = () => { }) => {
    ScheduleResourceTick(GetCurrentResourceName());
    execute(query, parameters)
        .then(result => callback(result && result[0] && Object.values(result[0])[0]));
});

global.exports("insert", (query, parameters = [], callback = () => { }) => {
    ScheduleResourceTick(GetCurrentResourceName());
    execute(query, parameters)
        .then(result => callback(result && result.insertId));
});
