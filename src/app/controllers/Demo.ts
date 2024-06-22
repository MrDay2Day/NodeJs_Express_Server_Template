import { NextFunction, Request, Response } from "express";

// To access database functionality

// To Use PostGres Database
// Check NodeJS pg documentation
import { pg_pool } from "../../config/postgres/config";

// To use MySQL Database
// Check NodeJS pg documentation
// Check mysql2/promise documentation
import { my_sql_access } from "../../config/db_config";

// To use MongoDB Database simply import Schema for collection from the 'models/database/mongodb/**'
import Demo from "../models/database/mongo/schemas/Demo";

// To use socket connection
import { getIO } from "../../utils/socket";
/**
 *  Examples use of SocketIO websocket
 *   const io = getIO();
    io.to(SOCKET_ID | SOCKET_ROOM).emit("update-user-info", parsedData);
 */

class DemoController {
  static async auth_demo(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ valid: true, route: "auth_demo" });
    } catch (error: any) {
      res.status(400).json({ valid: false, code: "DEMO000001", error });
    }
  }

  // Demo handling post request
  static async no_auth_demo(req: Request, res: Response, next: NextFunction) {
    try {
      const { number } = req.body as { number?: number };
      // number is already validated to exist from the middleware 'check_number' from 'route_auth'

      res.status(200).json({ valid: true, route: "no_auth_demo", number });
    } catch (error: any) {
      res.status(400).json({
        valid: false,
        code: "DEMO000002",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  // Demo controller to handle file upload using multer
  static async handle_file(req: Request, res: Response, next: NextFunction) {
    try {
      const { files } = req;
      const { demo, name } = req.body as { demo: string; name: string };

      console.log({ files, demo });

      res.status(200).json({ valid: true, route: "handle_file" });
    } catch (error: any) {
      res.status(400).json({
        valid: false,
        code: "DEMO000003",
        msg: error.msg || "Something went wrong.",
      });
    }
  }
}

export default DemoController;
