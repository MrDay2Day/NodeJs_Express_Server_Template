import mysql from "mysql2/promise";
const sql_promise = mysql;

const connection_data = {
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DB,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
};

export const sql_pool = process.env.MYSQL_ACTIVE
  ? sql_promise.createConnection(connection_data)
  : null;
