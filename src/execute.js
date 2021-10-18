import { pool } from './pool';
import { parseParameters } from './parser';
import { slowQueryWarning, debug, resourceName } from './config';
import { FormatError } from './errors';

const execute = async (query, parameters, resource) => {
  try {
    [query, parameters] = parseParameters(query, parameters);
    const [rows, _, executionTime] = await pool.query(query, parameters);

    if (executionTime >= slowQueryWarning || debug)
      console.log(
        `^3[${debug ? 'DEBUG' : 'WARNING'}] ${resource} took ${executionTime}ms to execute a query!
        ${query} ${JSON.stringify(parameters)}^0`
      );

    ScheduleResourceTick(resourceName);
    return rows;
  } catch (error) {
    console.log(
      `^1[ERROR] ${resource} was unable to execute a query!
        ${error.message}
        ${error.sql || `${query} ${JSON.stringify(parameters)}`}^0`
    );
    debug && console.trace(error);
  }
};

const queryType = (query) => {
  switch (query.replace(/\s.*/, '')) {
    case 'SELECT':
      return 1;
    case 'INSERT':
      return 2;
    case 'UPDATE':
      return 3;
    case 'DELETE':
      return 3;
    default:
      return false;
  }
};

const preparedStatement = async (query, parameters, resource) => {
  try {
    if (!Array.isArray(parameters))
      throw new FormatError(`Placeholders were defined, but query received no parameters!`, query);

    if (typeof query !== 'string') throw new FormatError(`Prepared statements must utilise a single query`);

    const type = queryType(query);
    if (!type) throw new FormatError(`Prepared statements only accept SELECT, INSERT, UPDATE, and DELETE methods!`);

    const results = [];
    for (let i = 0; i < parameters.length; i++) {
      const [rows] = await pool.execute(query, parameters[i]);
      results[i] = rows && (type === 1 ? rows : type === 2 ? rows.insertId : type === 3 ? rows.affectedRows : [rows]);
    }

    ScheduleResourceTick(resourceName);
    return results.length === 1? (type === 1 ? results[0][0] : results[0]) : results;
  } catch (error) {
    console.log(
      `^1[ERROR] ${resource} was unable to execute a query!
        ${error.message}
        ${error.sql || `${query} ${JSON.stringify(parameters)}`}^0`
    );
    debug && console.trace(error);
  }
};

export { execute, preparedStatement };
