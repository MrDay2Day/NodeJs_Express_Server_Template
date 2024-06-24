import dotenv from "dotenv";
dotenv.config();

process.on("APP STACK WARNING", (e) => console.warn(e.stack));
console.log(
  `
\n**************************************\n
        START ${process.env.APP_NAME} SERVER\n
**************************************\n`
);

console.log("INITIALIZING MIDDLEWARE AND ENDPOINTS...");
import { app } from "./middleware/modules";
import mainRouter from "./app/app";
app.use("/", mainRouter);
console.log("INITIALIZATION COMPLETE!");

import http from "http";
import DBConfiguration from "./config/db_config";
console.log("INITIALIZATION COMPLETE!");

console.log("INITIALIZING SERVER...");
const server = http.createServer(app);
console.log("WEBSERVER INITIALIZED!");
DBConfiguration.initiate(server);
