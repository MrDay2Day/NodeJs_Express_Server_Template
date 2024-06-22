import mongoose from "mongoose";
import { MONGO_DEFAULT_DATABASE } from "../dbConnections";

import { Document } from "mongoose"; // Mongodb Document type
import { DemoTypes } from "../../types/Demo_Types";

const MainDb = MONGO_DEFAULT_DATABASE;
const Schema = mongoose.Schema;

export type DemoSchemaType = Document & DemoTypes;

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
