import { NextFunction, Request, Response } from "express";
// This the validation results for or custom middleware validations
import { validationResult } from "express-validator";
import { DemoTypes } from "../models/database/types/Demo_Types";

import { faker } from "@faker-js/faker";

/**
 *
 *  To access database functionality
 *
 * */

// To Use PostGres Database
// Check NodeJS pg documentation
import { query_pg } from "../../config/postgres/config";

// To use MySQL Database
// Check mysql2/promise documentation
import { connect_sql } from "../../config/mysql/config";
import { QueryResult } from "mysql2/promise";

// To use MongoDB Database simply import Schema for collection from the 'models/database/mongodb/schemas**'
import Demo from "../models/database/mongo/schemas/Demo";

// To use socket connection
import { getIO } from "../../utils/socket";
/**
 *  Examples use of SocketIO websocket
...
const io = getIO();
io.to(<SOCKET_ID | SOCKET_ROOM>).emit("<listener>", data);
...
*/

// Handling multipart/form-data inside the controller
import { multer_single_image } from "../../middleware/multer";
import multer from "multer";
import FileManagement, { fetchFile } from "../apis/FileManagement";
// Sample Upload Data
import { demo_image_file, excel_file } from "./file_info";

function generate_user() {
  return {
    userId: faker.string.uuid(),
    username: faker.internet.userName(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    full_name: faker.person.fullName(),
    phone: parseInt(`1876${faker.string.numeric("#######")}`),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    dob: faker.date.birthdate(),
    registeredAt: faker.date.past(),
    userType: "User",
  };
}

class DemoController {
  // Demo handling post request
  static async no_auth_demo(req: Request, res: Response, next: NextFunction) {
    try {
      const { number } = req.body as { number?: number };
      // number is already validated to exist from the middleware 'check_number' from 'route_auth'

      return res
        .status(200)
        .json({ valid: true, route: "no_auth_demo", number });
    } catch (error: any) {
      return res.status(400).json({
        valid: false,
        code: "DEMO000002",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  // Demo handling get request
  static async auth_demo(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.statusCode = 400;
        console.log(errors);
        return res.json({
          valid: false,
          error: {
            code: "VAL000001",
            msg: "Validation error",
            errors: errors.mapped(),
          },
        });
      }

      const { number, email } = req.body as { number: number; email: string };
      return res
        .status(200)
        .json({ valid: true, route: "auth_demo", req_body: { number, email } });
    } catch (error: any) {
      return res.status(400).json({ valid: false, code: "DEMO000001", error });
    }
  }

  // Demo controller to handle file upload using multer before the controller
  static async handle_file_1(req: Request, res: Response, next: NextFunction) {
    try {
      const { files, file } = req;
      const { demo, name } = req.body as { demo: string; name: string };
      const { type } = req.params;

      console.log({ files, file, demo });

      const file_data = await FileManagement.upload(
        type, // "document" | "image" | (Optional: "profileImage")
        "1234567890abcdefg",
        file
      );

      // Uncomment to be able to return the file uploaded.
      // --
      // return await fetchFile({
      //   fileName: file_data.uploadRegularData.fileName,
      //   contentType: file_data.uploadRegularData.contentType,
      //   res,
      // });

      return res
        .status(200)
        .json({ valid: true, route: "handle_file", file_data, body: req.body });
    } catch (error: any) {
      return res.status(400).json({
        valid: false,
        code: "DEMO000003A",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  // Here we use multer to handle multipart/form-data in the controller for a more custom experience, here we can deliver a custom error message or handle errors in another manor.
  static async handle_file_2(req: Request, res: Response, next: NextFunction) {
    multer_single_image(req, res, function (err) {
      try {
        if (err instanceof multer.MulterError) {
          console.log("Multer Error", { err });
          throw { err };
        } else if (err) {
          console.log("Unknown Error", { err });
          throw { err };
          // An unknown error occurred when uploading.
        }
        const { files, file } = req;
        const { demo, name } = req.body as { demo: string; name: string };

        console.log({ files, file, demo });

        return res.status(200).json({ valid: true, route: "handle_file" });
      } catch (error: any) {
        return res.status(400).json({
          valid: false,
          code: "DEMO000003B",
          msg: error.msg || "Something went wrong.",
        });
      }
    });
  }

  /*
  Demo of fetching a file securely and serving to frontend from Backblaze S3 whether it an image or file.
  */
  static async fetch_file(req: Request, res: Response, next: NextFunction) {
    try {
      // This is the information that needed to fetch the file

      /**
       Please take note of the required fields from "demo_file_info" which is the dat your get from uploading a file.
       
       NB: For images ONLY you get "uploadThumbnailData" AND "uploadRegularData" while every other file type ONLY has "uploadRegularData"
       *  */
      return await fetchFile({
        fileName: demo_image_file.uploadRegularData.fileName,
        contentType: demo_image_file.uploadRegularData.contentType,
        res,
      });
    } catch (error: any) {
      return res.status(400).json({
        valid: false,
        code: "DEMO000003B",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  // Demo handling url queries
  static async handle_queries(req: Request, res: Response, next: NextFunction) {
    const { a, b, c } = req.query as {
      a: string | undefined;
      b: string | undefined;
      c: string | undefined;
    };
    console.log({ a, b, c });
    return res.json({ a, b, c });
  }

  // Demo handling url params
  static async handle_params(req: Request, res: Response, next: NextFunction) {
    const { x, y, z } = req.params as {
      x: string | undefined;
      y: string | undefined;
      z: string | undefined;
    };
    console.log({ x, y, z });
    return res.json({ x, y, z });
  }

  // Example Inserting user into MySQL Database
  static async create_user_mysql(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const demo_user = generate_user();

      const user_dob_year = demo_user.dob.getFullYear();
      const age = new Date().getFullYear() - user_dob_year;

      const sql = await connect_sql();
      const [info] = (await sql.query(
        `insert into demo(name, age, dob, userType) values(?, ?, ?, ?)`,
        [demo_user.full_name, age, demo_user.dob, demo_user.userType]
      )) as { insertId: number }[];

      type SelectDemoUserType = QueryResult & [DemoTypes];
      const [query_res] = (await sql.query(`select * from demo where id=?`, [
        info.insertId,
      ])) as SelectDemoUserType[];

      const user = query_res[0];

      sql.end();

      return res.status(200).json({ data: user, valid: true });
    } catch (error: any) {
      console.log({ error });
      return res.status(400).json({
        valid: false,
        code: "DEMO000007",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  // Example Inserting user into PostGres Database
  static async create_user_postgres(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const demo_user = generate_user();

      const user_dob_year = demo_user.dob.getFullYear();
      const age = new Date().getFullYear() - user_dob_year;

      const data = await query_pg(
        `insert into demo(name, age, dob, userType) values($1, $2, $3, $4) returning id, name, age, dob, userType, createdAt, updatedAt;`,
        [demo_user.full_name, age, demo_user.dob, demo_user.userType]
      );

      const user = data.rows[0] as DemoTypes;

      return res.status(200).json({ data: user, valid: true });
    } catch (error: any) {
      console.log({ error });
      return res.status(400).json({
        valid: false,
        code: "DEMO000008",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  // Example Inserting user into MySQL Database
  static async create_user_mongo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const demo_user = generate_user();

      const user_dob_year = demo_user.dob.getFullYear();
      const age = new Date().getFullYear() - user_dob_year;

      const data = new Demo({
        _id: demo_user.userId,
        name: demo_user.full_name,
        age,
        dob: demo_user.dob,
        userType: demo_user.userType,
      });
      await data.save();

      return res.status(200).json({ data, valid: true });
    } catch (error: any) {
      console.log({ error });
      return res.status(400).json({
        valid: false,
        code: "DEMO000009",
        msg: error.msg || "Something went wrong.",
      });
    }
  }
}

export default DemoController;
