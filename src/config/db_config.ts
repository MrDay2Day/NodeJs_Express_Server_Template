import http from "http";

import { ConnectMongoDB } from "./mongo/config";
import { ConnectMySQL } from "./mysql/config";
import { ConnectPostGres } from "./postgres/config";
import { start_server } from "./server_config";

console.log("INITIALIZING DATABASE CONNECTION...");

class DBConfiguration {
  static async initiate(
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
  ) {
    try {
      if (process.env.MONGO_ACTIVE) {
        await ConnectMongoDB();
      }

      if (process.env.PG_ACTIVE) {
        await ConnectPostGres();
      }

      if (process.env.MYSQL_ACTIVE) {
        await ConnectMySQL();
      }
      return start_server(server);
    } catch (error) {
      //
      console.log("DBConfiguration.initiate", { error });
    }
  }
}

export default DBConfiguration;
