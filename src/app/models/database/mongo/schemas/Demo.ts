import mongoose from "mongoose";
import { MONGO_DEFAULT_DATABASE } from "../dbConnections";

import { Document } from "mongoose"; // Mongodb Document type

const MainDb = MONGO_DEFAULT_DATABASE;
const Schema = mongoose.Schema;

export enum UserType {
  Admin = "Admin",
  User = "User",
  Visitor = "Visitor",
}

export type DemoSchemaType = Document & {
  name: string;
  age?: number;
  dob: Date;
  userType: UserType;
};

const DemoOptions = {
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  dob: {
    type: Date,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
};

const demoSchema = new Schema<DemoSchemaType>(DemoOptions, {
  timestamps: true,
  shardKey: { _id: 1 },
});

demoSchema.method("updateAge", async function (new_age: number) {
  this.age = new_age;
  await this.save();
  return this;
});

const Demo = MainDb.model<DemoSchemaType>("Demo", demoSchema);
export default Demo;
