import { createToken, createSystemToken } from "../../utils/jwt";
import { v4 as uuidv4 } from "uuid";

import mongoose from "mongoose";
const mongo = mongoose.connection.readyState;
import { io } from "../../../utils/socket";

import { CookieOptions, NextFunction, Request, Response } from "express";
import DBConfiguration from "../../../config/db_config";

type NewReqType = Request & { userId: string };

/**
 * The `Misc` class provides static methods for handling various requests and errors.
 */
class Misc {
  /**
   * Handles ping requests, setting cookies and responding with server status.
   *
   * @static
   * @async
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next middleware function.
   * @returns {Promise<void>} A promise that resolves when the request is handled.
   * @throws Will throw an error if any issues occur while handling the request.
   * @example
   * app.get('/ping', Misc.ping);
   */
  static ping = async (req: Request, res: Response): Promise<void> => {
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
                  date,
                  server_status: true,
                  production:
                    process.env.NODE_ENV === "production" ? true : false,
                  secondary_modules: {
                    socket_status: io ? true : false,
                    redis_status: !!process.env.USE_REDIS,
                    database_status: {
                      mongodb: DBConfiguration.database_status().mongodb,
                      mysql: DBConfiguration.database_status().mysql,
                      postgres: DBConfiguration.database_status().postgres,
                    },
                  },
                },
                valid: true,
              }
        )
        .send();
    } catch (err) {}
  };

  /**
   * Validates the user by checking the `userId` in the request object.
   *
   * @static
   * @async
   * @param {NewReqType} req - The request object, extended with `userId`.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next middleware function.
   * @returns {Promise<void>} A promise that resolves when the request is handled.
   * @throws Will throw an error if the user is not valid.
   * @example
   * app.post('/validate', Misc.validate);
   */
  static validate = async (req: NewReqType, res: Response): Promise<void> => {
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

  /**
   * Handles 404 errors by responding with a 404 status and a simple HTML message.
   *
   * @static
   * @async
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next middleware function.
   * @returns {Promise<void>} A promise that resolves when the request is handled.
   * @example
   * app.use(Misc.error404);
   */
  static error404 = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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
