import { MONGOOSE_OPTIONS, LOCAL_URL } from "../config/mongo/config";

import mongoose from "mongoose";

export const db = mongoose
  .connect(LOCAL_URL, MONGOOSE_OPTIONS)
  .then((connection: any) => {
    // console.log({ connectionStatus });
    console.log({ LOCAL_URL });

    // connectionStatus.connections[0].client._maxListeners =
    //   Number.MAX_SAFE_INTEGER;
    // connectionStatus.connections[0].db._maxListeners = Number.MAX_SAFE_INTEGER;

    console.log("MongoDB database connected...");
    return connection;
  });
