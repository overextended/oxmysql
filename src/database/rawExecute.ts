import { RowDataPacket } from 'mysql2';
import { pool } from '.';
import { logQuery } from '../logger';
import { CFXCallback, CFXParameters, QueryResponse } from '../types';
import { parseResponse } from '../utils/parseResponse';
import { executeType, parseExecute, parseValues } from '../utils/parseExecute';
import { scheduleTick } from '../utils/scheduleTick';

export const rawExecute = async (
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback,
  throwError?: boolean
) => {
  const type = executeType(query);
  parameters = parseExecute(parameters);
  let response = [] as any;

  if (!parameters.every(Array.isArray)) parameters = [[...parameters]];

  await scheduleTick();

  return await new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err.message);
      if (parameters.length === 0) return reject(`Query received no parameters.`);

      const placeholders = query.split('?').length - 1;

      parameters.forEach((values, index) => {
        const executionTime = process.hrtime();
        values = parseValues(placeholders, values);

        connection.execute(query, values, (err, results: RowDataPacket[][]) => {
          if (err) {
            connection.release();
            return reject(err.message);
          }

          if (cb) {
            if (results.length > 1) {
              for (const value of results) {
                response.push(parseResponse(type, value));
              }
            } else response.push(parseResponse(type, results));
          }

          logQuery(invokingResource, query, process.hrtime(executionTime)[1] / 1e6, values as typeof parameters);

          if (index === parameters.length - 1) {
            connection.release();

            if (cb) {
              if (response.length === 1) {
                if (type === null) {
                  if (response[0][0] && Object.keys(response[0][0]).length === 1)
                    resolve(Object.values(response[0][0])[0]);
                  else resolve(response[0][0]);
                } else {
                  resolve(response[0]);
                }
              } else {
                resolve(response);
              }
            }
          }
        });
      });
    });
  })
    .then(async (response) => {
      if (cb)
        try {
          await cb(response);
        } catch (err) {
          if (typeof err === 'string') {
            if (err.includes('SCRIPT ERROR:')) return console.log(err);
            console.log(`^1SCRIPT ERROR in invoking resource ${invokingResource}: ${err}^0`);
          }
        }
    })
    .catch((err) => {
      const error = `${invokingResource} was unable to execute a query!\n${err}\n${`${query}`}`;

      TriggerEvent('oxmysql:error', {
        query: query,
        parameters: parameters,
        message: err.message,
        err: err,
        resource: invokingResource,
      });

      if (cb && throwError) return cb(null, error);
      throw new Error(error);
    });
};
