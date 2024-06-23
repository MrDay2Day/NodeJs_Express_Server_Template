import pg, { PoolConfig } from "pg";
const { Pool } = pg;

export const pg_connection_data = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASS,
  port: process.env.PG_PORT,
};

export const pg_connection_data_with_database = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
  port: process.env.PG_PORT,
};

export const pg_pool = async function (connection: PoolConfig) {
  const pg_conn = new Pool(connection);
  return await pg_conn.connect();
};

export const connect_pg = async function () {
  const pg_conn = new Pool(pg_connection_data_with_database);
  return await pg_conn.connect();
};

export const query_pg = async function (
  query: string,
  params: (string | number | boolean | Date)[]
) {
  const pg_conn = new Pool(pg_connection_data_with_database);
  return await pg_conn.query(query, params);
};
