import express from "express";
const mainRouter = express.Router();
// const { checkAuth } = require("./routers/utils/is_auth"); // Checking if this is a valid user with credentials to automatically make logs

import routes from "./routes";

// Main router
mainRouter.use("/server", routes);

export default mainRouter;
