import { RowDataPacket } from 'mysql2';
import { pool } from '.';
import { logQuery } from '../logger';
import { CFXCallback, CFXParameters } from '../types';
import { parseResponse } from '../utils/parseResponse';
import { executeType, parseExecute } from '../utils/parseExecute';
import { scheduleTick } from '../utils/scheduleTick';
import { isServerConnected, waitForConnection } from '../database';

export const rawExecute = (
  invokingResource: string,
  query: string,
  parameters: CFXParameters,
  cb?: CFXCallback,
  throwError?: boolean,
  unpack?: boolean
) => {
  if (typeof query !== 'string')
    throw new Error(
      `${invokingResource} was unable to execute a query!\nExpected query to be a string but received ${typeof query} instead.`
    );

  const type = executeType(query);
  const placeholders = query.split('?').length - 1;
  parameters = parameters ? parseExecute(placeholders, parameters) : [];
  let response = [] as any;

  scheduleTick();

  return new Promise(async (resolve, reject) => {
    if (!isServerConnected) await waitForConnection();

    pool.getConnection((err, connection) => {
      if (err) return reject(err.message);

      const parametersLength = parameters.length == 0 ? 1 : parameters.length;

      for (let index = 0; index < parametersLength; index++) {
        const executionTime = process.hrtime();
        const values = parameters[index];

        if (values && placeholders > values.length) {
          for (let i = values.length; i < placeholders; i++) {
            values[i] = null;
          }
        }

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

          if (index === parametersLength - 1) {
            connection.release();

            if (cb) {
              if (response.length === 1) {
                if (unpack && type === null) {
                  if (response[0][0] && Object.keys(response[0][0]).length === 1) {
                    resolve(Object.values(response[0][0])[0]);
                  } else resolve(response[0][0]);
                } else {
                  resolve(response[0]);
                }
              } else {
                resolve(response);
              }
            }
          }
        });
      }
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
