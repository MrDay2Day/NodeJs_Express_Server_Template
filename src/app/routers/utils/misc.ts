import { createToken, createSystemToken } from "../../utils/jwt";
import { v4 as uuidv4 } from "uuid";

import mongoose from "mongoose";
const mongo = mongoose.connection.readyState;
import { io } from "../../../utils/socket";

import { CookieOptions, NextFunction, Request, Response } from "express";

type NewReqType = Request & { userId: string };
class Misc {
  static ping = async (req: Request, res: Response, next: NextFunction) => {
    const date = new Date();

    // console.log(req.cookies);

    type NewCookieOptions = CookieOptions & {
      production: boolean;
      date: Date;
    };

    const options: NewCookieOptions = {
      // httpOnly: true,
      // path: "/server",
      production: process.env.NODE_ENV === "production" ? true : false,
      secure: process.env.COOKIES_SECURE ? true : false,
      sameSite: true,
      date,
    };

    try {
      if (!req.cookies.ping) {
        const pingToken = await createSystemToken({
          data: new Date(Date.now()),
        });

        // Minerva Ping Token for authentication to server this stays with all devices.

        res.cookie("ping", pingToken.token, options);
      }

      // Minerva System Token for authenticating devices used by user
      if (!req.cookies.systemToken) {
        const systemToken = await createSystemToken({
          data: new Date(Date.now()),
        });

        res.cookie("systemToken", systemToken.token, options);
      }

      res
        .json(
          process.env.NODE_ENV === "production"
            ? { valid: true }
            : {
                success: {
                  server_status: true,
                  secondary_modules: {
                    database: process.env.DB_TYPE,
                    production:
                      process.env.NODE_ENV === "production" ? true : false,
                    socket_status: io ? true : false,
                    date,
                  },
                },
                valid: true,
              }
        )
        .send();
    } catch (err) {}
  };

  static validate = async (
    req: NewReqType,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.userId;
      if (userId) {
        res.json({ valid: true });
      } else {
        throw new Error("Not valid");
      }
    } catch (err) {
      res.json({ valid: false });
    }
  };

  static error404 = async (req: Request, res: Response, next: NextFunction) => {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html");
    res.send(`<div><h1>Page does not exist</h1></div>`);
  };

  static sysError = async (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const status = error.statusCode || 500;
    const message = error.message || "Critical system error";
    const data = error.data;
    res.statusCode = 500;
    res.json({ err: { msg: message, data }, valid: false });
  };
}

export default Misc;
