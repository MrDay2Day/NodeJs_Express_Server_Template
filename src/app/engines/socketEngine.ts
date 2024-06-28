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
    console.log(request.headers);
    socket.onAny(async (event: string) => {
      console.log({ event }, socket.data);
    });

    /**Examples of general socket listeners */
    socket.on("ping", async (data, callback) => {
      try {
        const io = await getIO();
        /**This function should be used to validate socket connection that it is associated with a valid user. */
        await validate_socket(socket);
        console.log("Received PING data:", {
          data,
        });
        const response = { valid: true, serverInstanceId, time: new Date() };
        /**Example -> Sending a socket message, this message is sent to all who are listening to the "all" event.
         * Also this message, if redis/keydb is enabled is distributed to all server instances that are connected to the Pub/Sub connection.
         */
        io.to(data.to).emit("hello", data);
        /**Callback used to send data back to the client if applicable. */
        if (callback) callback(response);
      } catch (err) {
        console.log({ err });
      }
    });

    socket.on("demo", async (data, callback) => {
      try {
        /**This function should be used to validate socket connection that it is associated with a valid user. */
        await validate_socket(socket);
        console.log("Received Demo data:", {
          data,
        });
        /**Callback used to send data back to the client if applicable. */
        if (callback)
          callback({ valid: true, serverInstanceId, time: new Date() });
      } catch (err) {
        console.log({ err });
      }
    });
  }

  static async joinSocketRoom(socketRoom: string, socketId: string) {
    try {
      console.log({ socketRoom, socketId });
      /** Establishing SocketIO Server Access */
      const io = await getIO();

      /** getting the socket connection instance for the ID */
      const socket = io.sockets.sockets.get(socketId);

      /** Adding socket id to the user's private socket room */
      if (socketRoom) {
        socket?.join(socketRoom);
      }

      /** Getting a list of the main socket room */
      const main_socket_room = io.sockets.adapter.rooms.get(
        process.env.APP_MAIN_SOCKET_ROOM
      );

      /** Add socket connection to the main socket room */
      if (main_socket_room) {
        /** Checking if main socket room has the new ID */
        const has_socket_conn = main_socket_room.has(socketId);
        if (!has_socket_conn) {
          socket?.join(process.env.APP_MAIN_SOCKET_ROOM);
        }
      } else {
        /** If the room does not exist on this server it will be created upon adding the ID */
        socket?.join(process.env.APP_MAIN_SOCKET_ROOM);
      }

      console.log(`${socketRoom} IDs`, {
        ids: io.sockets.adapter.rooms.get(socketRoom),
      });
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
