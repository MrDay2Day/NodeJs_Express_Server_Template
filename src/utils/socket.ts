/** This files allows us to share our SocketIO connection across the application. */
console.log("INITIALIZING SOCKET CONNECTION...");

import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";
import http from "http";

const pubClient =
  process.env.USE_REDIS === "y"
    ? createClient({
        url: process.env.REDIS_URL,
      })
    : null;

const subClient = process.env.USE_REDIS === "y" ? pubClient?.duplicate() : null;

export let io: Server;

let totalDataSent = 0;
export async function init(httpServer: http.Server) {
  io = new Server(httpServer, {
    // secure: true,
    cookie: true,
    pingTimeout: 30000,
    pingInterval: 30000,
    path: `/${process.env.APP_SOCKET_NAME}/`,
  });

  if (process.env.USE_REDIS === "y") {
    console.log("ATTEMPTING TO CONNECT TO REDIS SERVER!");
    let redisConnect = true;
    try {
      if (!pubClient?.isOpen) {
        await pubClient?.connect();
      }
    } catch (error) {
      redisConnect = false;
      console.log("REDIS PUBLISHING CLIENT UNABLE TO CONNECT!!!", error);
    }

    try {
      if (!subClient?.isOpen) {
        await subClient?.connect();
      }
    } catch (error) {
      redisConnect = false;
      console.log("REDIS SUBSCRIBING CLIENT UNABLE TO CONNECT!!!", error);
    }
    redisConnect ? io.adapter(createAdapter(pubClient, subClient)) : null;

    subClient?.on("connect", () => {
      console.log("REDIS SUBSCRIBING CLIENT CONNECTED!!!");
    });
    pubClient?.on("connect", () => {
      console.log("REDIS PUBLISHING CLIENT CONNECTED!!!");
    });
    subClient?.on("error", (redisErr: any | unknown) => {
      console.log({ redisErr });
    });
    pubClient?.on("error", (redisErr: any | unknown) => {
      console.log({ redisErr });
    });
    // console.log({ io });
    console.log("SECURE WEBSOCKET INITIALIZED!");
  }

  return io;
}

export async function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  console.log("SOCKET.IO INITIALIZED!");
  return io;
}

export async function redisServer() {
  if (process.env.USE_REDIS === "y") {
    return pubClient?.duplicate();
  } else {
    return false;
  }
}

/**
 * To use io
 * const { getIO } = require("../socket");
 * 
 * => Server Side
 * 
  * io.getIO().emit("event", 
  *   { 
  *     action: "create",
  *     data: { ... }
  *   }
  * );
  * 
  * io.to(<client/room id>).emit("event", 
  *   { 
  *     action: "create",
  *     data: { ... }
  *   }
  * );
 * 
 * 
 * => Client side
 * 
  * socket.on("event", (data) => {
        if(data.action === "create"){
          console.log({ data })
        }
      });
 */
