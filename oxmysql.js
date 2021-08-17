/// <reference path="node_modules\@citizenfx\server\index.d.ts" />
const { createPool } = require('mysql2/promise');

const pool = createPool({
    host: 'localhost',
    user: 'root',
    database: 'es_extended'
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

exports("execute", (query, parameters = [], callback = () => { }) => {
    execute(query, parameters)
        .then(result => callback(result && result.affectedRows));
    process._tickCallback()
});

exports("fetch", (query, parameters = [], callback = () => { }) => {
    execute(query, parameters)
        .then(result => callback(result));
    process._tickCallback();
});

exports("single", (query, parameters = [], callback = () => { }) => {
    execute(query, parameters)
        .then(result => callback(result && result[0] && result[0][0]));
    process._tickCallback();
});

exports("scalar", (query, parameters = [], callback = () => { }) => {
    execute(query, parameters)
        .then(result => callback(result && result[0] && result[0][0] && Object.values(result[0][0])[0]));
    process._tickCallback();
});

exports("insert", (query, parameters = [], callback = () => { }) => {
    execute(query, parameters)
        .then(result => callback(result && result.insertId));
    process._tickCallback();
});