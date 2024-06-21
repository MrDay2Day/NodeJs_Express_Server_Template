import express from "express";
import DemoController from "../controllers/Demo";

import { valid_req, check_number } from "./utils/route_auth";
import { multer_multi_file } from "../../middleware/multer";

const demoRouter = express.Router();

// Implementing route validations
demoRouter.get("/get", DemoController.no_auth_demo);
demoRouter.post("/post", valid_req, check_number, DemoController.auth_demo);
demoRouter.post(
  "/file",
  valid_req,
  multer_multi_file,
  DemoController.handle_file
);

export default demoRouter;
