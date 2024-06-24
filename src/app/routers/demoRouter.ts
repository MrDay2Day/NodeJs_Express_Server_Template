import express from "express";
import DemoController from "../controllers/DemoController";

import { valid_req, check_number } from "./utils/route_auth";
import { multer_single_image } from "../../middleware/multer";
import { email_validator } from "./utils/validator";

const demoRouter = express.Router();

// Simple get route with no middleware validation
demoRouter.get("/get", DemoController.no_auth_demo);

// Implementing route validations

/**
 * This route has
        - Custom validation middleware => valid_req & check_number
        - express-validator middle ware enabled => email_validator
 */

demoRouter.post(
  "/post",
  valid_req,
  check_number,
  email_validator,
  DemoController.auth_demo
);

/**
 * This route has
        - Multer middleware so this route can accept multipart/form-data request which allows it to receive files
 */
// Using middleware on the route before the controller
demoRouter.post("/file-1", multer_single_image, DemoController.handle_file_1);
// Using middleware in the controller itself and not the route
demoRouter.post("/file-2", DemoController.handle_file_2);

//////////////////////////////////////////////////////////////

/**
 * Handling URL queries
        Example: http://localhost:3030/server/demo/query?a=2&b=4&c=9
 */
demoRouter.get("/query", DemoController.handle_queries);
/**
 * Handling URL params
        Example: http://localhost:3030/server/demo/params/e/f/g
 */
demoRouter.get("/params/:x/:y/:z", DemoController.handle_params);

//////////////////////////////////////////////////////////////
demoRouter.get("/create-mysql", DemoController.create_user_mysql);
demoRouter.get("/create-mongo", DemoController.create_user_mongo);
demoRouter.get("/create-postgres", DemoController.create_user_postgres);

export default demoRouter;
