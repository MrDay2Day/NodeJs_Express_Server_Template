// This files allows us to share our SocketIO connection across all files but importing this file.

import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const pubClient =
  process.env.USE_REDIS === "y"
    ? createClient({
        url: process.env.REDIS_URL,
      })
    : null;

const subClient = process.env.USE_REDIS === "y" ? pubClient?.duplicate() : null;

export let io: any;

let totalDataSent = 0;
import { Server } from "socket.io";
export const init = (httpServer: any) => {
  io = new Server(httpServer, {
    // secure: true,
    pingTimeout: 30000,
    pingInterval: 30000,
    path: "/minerva_socket/",
  });

  if (process.env.USE_REDIS === "y") {
    console.log("ATTEMPTING TO CONNECT TO REDIS SERVER!");
    let redisConnect = true;
    try {
      if (!pubClient?.isOpen) {
        pubClient?.connect();
      }
    } catch (error) {
      redisConnect = false;
      console.log("REDIS PUBLISHING CLIENT UNABLE TO CONNECT!!!", error);
    }

    try {
      if (!subClient?.isOpen) {
        subClient?.connect();
      }
    } catch (error) {
      redisConnect = false;
      console.log("REDIS SUBSCRIBING CLIENT UNABLE TO CONNECT!!!", error);
    }
    redisConnect ? io.adapter(createAdapter(pubClient, subClient)) : null;
    // console.log({ pubClient, subClient });

    subClient?.on("connect", () => {
      console.log("REDIS SUBSCRIBING CLIENT CONNECTED!!!");
    });
    subClient?.on("error", (redisErr: any) => {
      console.log({ redisErr });
    });
    pubClient?.on("connect", () => {
      console.log("REDIS PUBLISHING CLIENT CONNECTED!!!");
    });
    pubClient?.on("error", (redisErr: any) => {
      console.log({ redisErr });
    });
    // console.log({ io });
    console.log("SECURE WEBSOCKET INITIALIZED!");
  }

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  console.log("SOCKET.IO INITIALIZED!");
  return io;
};
export const redisServer = () => {
  if (process.env.USE_REDIS === "y") {
    return pubClient?.duplicate();
  } else {
    return false;
  }
};

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
