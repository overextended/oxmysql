import { mysql_debug, mysql_slow_query_warning } from '../config.js';
import { isReady, scheduleTick, serverReady, parseArguments, response } from '../utils.js';
import pool from './pool.js';

export default async (type, invokingResource, query, parameters, cb) => {
  if (!isReady) serverReady();
  let result, executionTime;

  try {
    [query, parameters, cb] = parseArguments(invokingResource, query, parameters, cb);
    scheduleTick();
    
    [result, _, executionTime] = await pool.query(query, parameters);

    if (executionTime >= mysql_slow_query_warning || mysql_debug)
      console.log(
        `^3[${mysql_debug ? 'DEBUG' : 'WARNING'}] ${invokingResource} took ${executionTime}ms to execute a query!
      ${query} ${JSON.stringify(parameters)}^0`
      );
  } catch (err) {
    throw new Error(`${invokingResource} was unable to execute a query!
    ${err.message}
    ${err.sql || `${query} ${JSON.stringify(parameters)}`}`);
  }

  if (cb) cb(response(type, result));
  else return response(type, result);
};
