import http from "http";
import { v4 as uuidv4 } from "uuid";
import { init } from "../utils/socket";
import { DisconnectReason } from "socket.io";
import SocketEngine from "../app/engines/socketEngine";
import { serverDataInfo } from "../utils/serverDataInfo";

export function start_server(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
  const serverInstanceId = String(uuidv4()).toUpperCase();
  console.log(`\n\nSERVER INSTANCE ID: ${serverInstanceId}\n`);
  server.listen(Number(process.env.PORT), async () => {
    console.log(
      `
**************************************\n
    ${process.env.APP_NAME} RUNNING ON PORT --> ${process.env.PORT}
\n**************************************\n`
    );

    const socket_io = init(server);
    socket_io.on("connection", (socket) => {
      console.log(
        `Socket connection made to ${socket.id} at ${socket.handshake.time}`
      );
      socket.on("disconnect", (reason: DisconnectReason) => {
        console.log(`Client ${socket.id} disconnected. Reason: ${reason}`);
        // if (socket.rooms) {
        // const roomArray = Array.from(socket.rooms, (value) => value);
        // roomArray.forEach((room) => {
        //   socket.leave(room);
        // });
        // console.log("index", { rooms: socket.rooms });
        // }
      });

      SocketEngine.listenerFunc(socket, socket.request, serverInstanceId);
    });
  });
  serverDataInfo(server);
}
