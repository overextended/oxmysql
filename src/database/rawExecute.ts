import { RowDataPacket } from 'mysql2';
import { pool } from '.';
import { logQuery } from '../logger';
import { CFXCallback, CFXParameters } from '../types';
import { parseResponse } from '../utils/parseResponse';
import { executeType, parseExecute, parseValues } from '../utils/parseExecute';
import { scheduleTick } from '../utils/scheduleTick';

export const rawExecute = async (
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback
) => {
  const type = executeType(query);
  parameters = parseExecute(parameters);
  let single: boolean;

  if (!parameters.every(Array.isArray)) parameters = [[...parameters]];

  const length = parameters.length - 1;

  await scheduleTick();

  await new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject([connection, err]);

      const execute = () => {
        const placeholders = query.split('?').length - 1;
        const response = [] as RowDataPacket;

        parameters.forEach((values, index) => {
          const executionTime = process.hrtime();
          values = parseValues(placeholders, values);

          connection.execute(query, values, (err, results: RowDataPacket[][]) => {
            if (err) return reject([connection, err]);

            if (cb) {
              if (results.length > 1) {
                for (const value of results) {
                  response.push(parseResponse(type, value));
                }
              } else response.push(parseResponse(type, results));
            }

            logQuery(invokingResource, query, process.hrtime(executionTime)[1] / 1e6, values as typeof parameters);

            if (index === length) {
              single = response.length === 1;
              if (!single && type !== null) connection.commit();
              connection.release();

              resolve(response);
            }
          });
        });
      };

      if (type === null) {
        execute();
      } else
        connection.beginTransaction((err) => {
          if (err) return reject(err);
          execute();
        });
    });
  })
    .catch(([connection, err]) => {
      if (!single && type !== null) connection.rollback();

      throw new Error(`${invokingResource} was unable to execute a query!
		${err.message}
		${err.sql}`);
    })
    // somebody who cares about types can do this
    .then((results: any) => {
      if (cb) {
        if (single) {
          if (type === null) {
            //@ts-expect-error
            if (results[0][0] && Object.keys(results[0][0]).length === 1) cb(Object.values(results[0][0])[0]);
            else cb(results[0][0]);
          } else {
            cb(results[0]);
          }
        } else {
          cb(results);
        }
      }
    });
};
