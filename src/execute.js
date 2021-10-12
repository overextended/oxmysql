import { pool } from './pool';
import { parseParameters } from './parser';
import { slowQueryWarning, debug, resourceName } from './config';

const execute = async (query, parameters, resource) => {
  ScheduleResourceTick(resourceName);
  try {

    [query, parameters] = parseParameters(query, parameters);

    const [rows, _, executionTime] = await pool.query(query, parameters);

    if (executionTime >= slowQueryWarning || debug)
      console.log(
        `^3[${debug ? 'DEBUG' : 'WARNING'}] ${resource} took ${executionTime}ms to execute a query!
        ${query} ${JSON.stringify(parameters)}^0`
      );

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

export { execute };
