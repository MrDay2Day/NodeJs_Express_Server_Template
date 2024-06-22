import mysql from "mysql2/promise";
const sql_promise = mysql;

export type MySQLConnectionType = {
  host: string;
  database?: string;
  user: string;
  password: string;
};

export const mysql_connection_data: MySQLConnectionType = {
  host: process.env.MYSQL_HOST,
  // database: process.env.MYSQL_DB,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
};

export const mysql_connection_data_with_database: MySQLConnectionType = {
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DB,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
};

// export const sql_pool = process.env.MYSQL_ACTIVE
//   ? sql_promise.createConnection(connection_data)
//   : null;

export const sql_pool = async function (configuration: MySQLConnectionType) {
  return await sql_promise.createConnection(configuration);
};
