import { getIO } from "../../utils/socket";
import { Socket } from "socket.io";
import http from "http";

import { verifyToken } from "../utils/jwt";
import { v4 as uuidv4 } from "uuid";

export default class SocketEngine {
  static async listenerFunc(
    socket: Socket,
    request: http.IncomingMessage,
    serverInstanceId: string
  ) {
    socket.onAny(async (event: string) => {
      console.log({ event }, socket.data);
    });

    socket.on("ping", async (data, callback) => {
      try {
        await validate_socket(socket);
        const roomArray = Array.from(socket.rooms, (value) => value);
        console.log("Received data:", {
          data,
          roomArray,
        });
        callback({ valid: true, serverInstanceId, time: new Date() });
      } catch (err) {
        console.log({ err });
      }
    });
  }

  static async joinSocketRoom(socketRoom: string, socketId: string) {
    try {
      console.log({ socketRoom, socketId });
      const io = getIO();
      const socket = io.sockets.sockets.get(socketId);

      if (socket?.rooms) {
        // console.log({ socketRoom: socket.rooms });
        const roomArray = Array.from(socket.rooms, (value) => value);
        roomArray.forEach((room) => {
          if (room == (socketRoom || "")) return;
          socket.leave(room);
        });
      }

      if (socketRoom) {
        socket?.join(socketRoom);
      }
      socket?.join(process.env.APP_MAIN_SOCKET_ROOM);

      io.sockets.adapter.rooms.get(socketRoom);
      console.log("UserManagement", { rooms: io.sockets.adapter.rooms });
      return true;
    } catch (err) {
      throw err;
    }
  }
}

async function validate_socket(socket: Socket) {
  console.log({ socket });
  const socket_id = socket.id;

  if (!socket_id) {
    throw new Error("Not Authenticated.");
  }
}
