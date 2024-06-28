import mysql from "mysql2/promise";
import {
  checkAndCreateMySQLDatabase,
  createMySQLTables,
} from "../../app/models/database/mysql/trigger";
import { text_bright_magenta } from "../../utils/serverDataInfo";
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

export const connect_sql = async function () {
  return await sql_promise.createConnection(
    mysql_connection_data_with_database
  );
};

export function ConnectMySQL() {
  console.log(text_bright_magenta("\tCONNECTING TO MYSQL DATABASE..."));
  return new Promise(async function (resolve, reject) {
    await checkAndCreateMySQLDatabase();
    let my_sql_access = await sql_pool(mysql_connection_data_with_database);

    await createMySQLTables(my_sql_access);
    const data = await my_sql_access.connect();
    my_sql_access.end();

    console.log(text_bright_magenta("\tMYSQL DATABASE CONNECTED!\n"));
    resolve(data);
  });
}
