import dotenv from "dotenv";
dotenv.config();

console.log("**********************\nSTART\n**********************");

// Middleware
import { app } from "./middleware/modules";

// Detail Error console logging
// process.on("warning", (e) => console.warn(e.stack));

// Main Routes import
import mainRouter from "./app/app";

// Connecting main routes
console.log("INITIALIZING MIDDLEWARE AND ENDPOINTS...");
app.use("/", mainRouter);
console.log("INITIALIZATION COMPLETE!");

/**
 *
 * Server Initialization
 *
 */

// Attaching imported WebSocket to Server
console.log("INITIALIZING SOCKET CONNECTION...");
import http from "http";
import { init, getIO } from "./utils/socket";
import SocketIOFunctions from "./app/engine/socket";
import DBConfiguration from "./config/db_config";
console.log("INITIALIZATION COMPLETE!");

console.log("INITIALIZING SERVER...");
const server = http.createServer(app);
const io = init(server); // WebSocket

/**
 *
 * Server Functionality
 *
 */

io.on("connection", (socket: any) => {
  console.log(
    `Socket connection made to ${socket.id} at ${socket.handshake.time}`
  );
  SocketIOFunctions.listenerFunc(socket, socket.request);
});

console.log("WEBSERVER INITIALIZED!");

DBConfiguration.initiate(server);
