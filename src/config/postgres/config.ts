import pg from "pg";
const { Pool } = pg;

export const pg_pool = process.env.PG_ACTIVE
  ? new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PASS,
      port: process.env.PG_PORT,
    })
  : null;
