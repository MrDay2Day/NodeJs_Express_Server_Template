// Mongoose options

import mongoose from "mongoose";
import { MongoMainListener } from "../../app/models/database/mongo/listener/listeners";
import { MongoMemoryReplSet, MongoMemoryServer } from "mongodb-memory-server";

export const MONGOOSE_OPTIONS = {
  // mongos: true,
  // poolSize: 10,
  socketTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  // useCreateIndex: true,
  noDelay: true,
  retryWrites: true,
};

export function ConnectMongoDB() {
  return new Promise(async function (resolve, reject) {
    const is_dev = process.env.NODE_ENV === "dev";

    const dev_server = is_dev
      ? await MongoMemoryReplSet.create({
          instanceOpts: [
            {
              port: 50111,
              storageEngine: "wiredTiger",
            },
            {
              port: 50112,
              storageEngine: "wiredTiger",
            },
            {
              port: 50113,
              storageEngine: "wiredTiger",
            },
          ],
          replSet: { dbName: process.env.MONGO_DEFAULT_DATABASE },
        })
      : null;
    const uri = is_dev ? dev_server?.getUri() || "" : process.env.MONGO_URL;
    console.log({ uri });

    await mongoose
      .connect(uri, MONGOOSE_OPTIONS)
      .then(async (data) => {
        console.log("MONGODB DATABASE CONNECTED!");
        if (process.env.MONGO_REPLICA_SET) MongoMainListener();
        resolve(data);
      })
      .catch((mongoErr: any) => {
        console.log({ mongoErr });
        reject(mongoErr);
      });
  });
}
