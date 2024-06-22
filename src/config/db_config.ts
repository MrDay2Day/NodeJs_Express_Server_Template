import http from "http";
import mongoose from "mongoose";
import { MONGOOSE_OPTIONS } from "./mongo/config";
import { serverDataInfo } from "../utils/serverDataInfo";
import { pg_pool } from "./postgres/config";
import { sql_pool } from "./mysql/config";
import { resolve } from "path";

console.log("INITIALIZING DATABASE CONNECTION...");

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
    if (pg_pool) {
      pg_pool
        .connect()
        .then((data) => {
          console.log("POSTGRES DATABASE CONNECTED!");
          resolve(data);
        })
        .catch((error) => {
          console.log({ error });
          reject(error);
        });
    }
  });
}

function ConnectMySQL() {
  return new Promise(async function (resolve, reject) {
    if (sql_pool) {
      const data = await (await sql_pool).connect();
      console.log("MYSQL DATABASE CONNECTED!");
      resolve(data);
    } else {
      reject({});
    }
  });
}

function start_server(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
  server.listen(Number(process.env.PORT), async () => {
    console.log(`SERVER RUNNING ON PORT --> ${process.env.PORT}`);
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
