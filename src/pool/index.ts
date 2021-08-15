import { createPool } from "mysql2/promise";

const pool = createPool({
  host: "localhost",
  user: "root",
  database: "es_extended",
});

export { pool };
