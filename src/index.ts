import { QueryError } from "mysql2/promise";
import { pool } from "./pool";

const execute = (
  query: string,
  callback: (result: any) => void,
  parameters?: { [key: string]: any }
) => {
  const startTime = process.hrtime.bigint();

  pool
    .execute(query, parameters)
    .then((result) => {
      const end = process.hrtime.bigint();
      console.log(`Query took ${Number(end - startTime) / 1000000} ms!`);
      callback(result[0]);
    })
    .catch((error) => {
      callback(false);
      console.log(error);
    });
};

global.exports(
  "execute",
  (
    query: string,
    parameters: { [key: string]: any },
    callback: (result: any) => void
  ) => {
    execute(query, callback, parameters);
  }
);
