process.on("APP STACK WARNING", (e) => console.warn(e.stack));

import dotenv from "dotenv";
dotenv.config();

import { app } from "./middleware/modules";
import mainRouter from "./app/app";
import http from "http";
import DBConfiguration from "./config/db_config";

function start() {
  try {
    console.log(
      `
    \n**************************************\n
            START ${process.env.APP_NAME} SERVER\n
    **************************************\n`
    );
    console.log("INITIALIZING MIDDLEWARE AND ENDPOINTS...");
    app.use("/", mainRouter);
    console.log("INITIALIZATION COMPLETE!");

    console.log("INITIALIZATION COMPLETE!");

    console.log("INITIALIZING SERVER...");
    const server = http.createServer(app);
    console.log("WEBSERVER INITIALIZED!");
    DBConfiguration.initiate(server);
  } catch (error) {
    console.log("SERVER ERROR", { error });
    start();
  }
}

start();
