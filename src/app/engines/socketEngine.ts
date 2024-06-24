import { getIO } from "../../utils/socket";
import { Socket } from "socket.io";
import http from "http";

import { verifyToken } from "../utils/jwt";
import { v4 as uuidv4 } from "uuid";

/**
  Recommendation 
  
  Assign each of your users a "socket_room_id" that is ONLY known on the server and never goes to the front end, after a user 'signs in'/'logs in' then send a post (with the socket connection id) or get request ()with the socket connection id as a query or params) to use the "joinSocketRoom" function to add the "socket.id" to the users private socket room. 

  When sending any message use the user's "id". When the message is sent to the user's "id" fetch the user's "socket_room_id" and then send message to that room.

 */

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

    socket.on("demo", async (data, callback) => {
      try {
        await validate_socket(socket);
        const roomArray = Array.from(socket.rooms, (value) => value);
        console.log("Demo:", {
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
  const socket_id = socket.id;

  /**
    Validate socket connection with "socket_room_id" method.

    When a socket is sending a message you SHOULD send the user's id when the event is triggered fetch the user info which will include the user's "socket_room_id" then check if that "socket.id" from the socket connection is in the user's private socket room, if it is then the message can be sent else throw an error.
   */
  if (!socket_id) {
    throw new Error("Not Authenticated.");
  }
}
