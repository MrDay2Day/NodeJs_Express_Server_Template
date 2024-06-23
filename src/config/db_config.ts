import http from "http";
import mongoose from "mongoose";
import { MONGOOSE_OPTIONS } from "./mongo/config";
import { serverDataInfo } from "../utils/serverDataInfo";
import { pg_connection_data, pg_pool } from "./postgres/config";
import { mysql_connection_data_with_database, sql_pool } from "./mysql/config";
import {
  checkAndCreateMySQLDatabase,
  createMySQLTables,
} from "../app/models/database/mysql/trigger";
import { Connection } from "mysql2/promise";
import {
  checkAndCreatePGDatabase,
  createPGTables,
} from "../app/models/database/potsgres/trigger";

console.log("INITIALIZING DATABASE CONNECTION...");

let my_sql_access: Connection | undefined;
let postgres_access: Connection | undefined;

function ConnectMongoDB() {
  return new Promise(async function (resolve, reject) {
    await mongoose
      .connect(process.env.MONGO_URL, MONGOOSE_OPTIONS)
      .then(async (data) => {
        console.log("MONGODB DATABASE CONNECTED!");
        resolve(data);
      })
      .catch((mongoErr: any) => {
        console.log({ mongoErr });
        reject(mongoErr);
      });
  });
}

function ConnectPostGres() {
  return new Promise(async function (resolve, reject) {
    try {
      await pg_pool(pg_connection_data);
      await checkAndCreatePGDatabase();
      await createPGTables();
      console.log("POSTGRES DATABASE CONNECTED!");

      resolve(true);
    } catch (error) {
      console.log({ error });
      reject(error);
    }
  });
}

function ConnectMySQL() {
  return new Promise(async function (resolve, reject) {
    await checkAndCreateMySQLDatabase();
    my_sql_access = await sql_pool(mysql_connection_data_with_database);

    await createMySQLTables(my_sql_access);
    const data = await my_sql_access.connect();
    my_sql_access.end();

    console.log("MYSQL DATABASE CONNECTED!");
    resolve(data);
  });
}

function start_server(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
  server.listen(Number(process.env.PORT), async () => {
    console.log(`WEBSERVER RUNNING ON PORT --> ${process.env.PORT}`);
  });
  serverDataInfo(server);
}

class DBConfiguration {
  static async initiate(
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
  ) {
    try {
      if (process.env.MONGO_ACTIVE) {
        console.log("CONNECTING TO MONGODB DATABASE...");
        await ConnectMongoDB();
      }

      if (process.env.PG_ACTIVE) {
        console.log("CONNECTING TO POSTGRES DATABASE...");
        await ConnectPostGres();
      }

      if (process.env.MYSQL_ACTIVE) {
        console.log("CONNECTING TO MYSQL DATABASE...");
        await ConnectMySQL();
      }
      return start_server(server);
    } catch (error) {
      //
    }
  }
}

export default DBConfiguration;
