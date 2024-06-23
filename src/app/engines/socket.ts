import { io } from "../../utils/socket";
import cookie from "cookie";

import { verifyToken } from "../utils/jwt";
import { v4 as uuidv4 } from "uuid";

class SocketIOFunctions {
  static listenerFunc = async (socket: any, request: any) => {
    socket.onAny(async (process: any, req: any) => {
      try {
        const cookies = await cookie.parse(request.headers.cookie);
        if (!req.token || !process || !cookies.systemToken) {
          throw new Error("Not Authenticated.");
        }

        // const authData = await socket_isAuth({
        //   token: req.token,
        //   systemToken: cookies.systemToken,
        // });

        // if (!req.data) {
        //   throw new Error("Invalid data.");
        // }
        // const data = req.data;

        // switch (process) {
        //   case "rate_process":
        //     console.log({ data, authData });
        //     break;

        //   default:
        //     break;
        // }
      } catch (err) {
        console.log({ err });
      }
    });
  };
}

export default SocketIOFunctions;
