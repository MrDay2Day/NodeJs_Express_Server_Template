import mongoose from "mongoose";
import { MONGO_DEFAULT_DATABASE } from "../dbConnections";

import { Document } from "mongoose";

const MainDb = MONGO_DEFAULT_DATABASE;
const Schema = mongoose.Schema;

export enum UserType {
  Admin = "Admin",
  User = "User",
  Visitor = "Visitor",
}

export type DemoSchemaTypes = Document & {
  name: string;
  age: number;
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
    required: true,
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

const demoSchema = new Schema<DemoSchemaTypes>(DemoOptions, {
  timestamps: true,
  shardKey: { _id: 1 },
});

const Demo = MainDb.model<DemoSchemaTypes>("Demo", demoSchema);
export default Demo;
