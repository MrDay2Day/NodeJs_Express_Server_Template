import http from "http";
import mongoose from "mongoose";
import { MONGOOSE_OPTIONS } from "./mongo/config";
import { serverDataInfo } from "../utils/serverDataInfo";
import { pg_pool } from "./postgres/config";
import { sql_pool } from "./mysql/config";

console.log("INITIALIZING DATABASE CONNECTION...");

class DBConfiguration {
  static async initiate(
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
  ) {
    try {
      console.log(`SELECTED DB ${process.env.DB_TYPE}`);
      switch (process.env.DB_TYPE) {
        case "mongo":
          mongoose
            .connect(process.env.LOCAL_URL, MONGOOSE_OPTIONS)
            .then(async () => {
              console.log("MONGODB DATABASE CONNECTED!");
              this.start_server(server);
            })
            .catch((mongoErr: any) => console.log({ mongoErr }));
          break;

        case "postgres":
          console.log("CONNECTING TO POSTGRES DATABASE...");
          pg_pool
            .connect()
            .then((data) => {
              console.log("POSTGRES DATABASE CONNECTED!");
              this.start_server(server);
            })
            .catch((error) => {
              console.log({ error });
            });

          break;

        case "mysql":
          console.log("CONNECTING TO MYSQL DATABASE...");
          await (await sql_pool).connect();
          console.log("MYSQL DATABASE CONNECTED!");
          this.start_server(server);

          break;
        default:
          break;
      }
    } catch (error) {
      //
    }
  }

  static start_server(
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
  ) {
    server.listen(Number(process.env.PORT), async () => {
      console.log(`SERVER RUNNING ON PORT --> ${process.env.PORT}`);
    });
    serverDataInfo(server);
  }
}

export default DBConfiguration;
