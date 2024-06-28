import mongoose from "mongoose";

import { MONGO_DEFAULT_DATABASE } from "../dbConnections";

/**Mongodb Document type */
import { Document } from "mongoose"; // Mongodb Document type
/**Importing type for this specific collection */
import { DemoTypes } from "../../types/Demo_Types";
/**Importing schemas array to push this schema's name to it. */
import { schemas } from "../../../../../config/mongo/config";

const MainDb = MONGO_DEFAULT_DATABASE;
const Schema = mongoose.Schema;

const collection = "Demo";
/**Adding collection name to schemas array so we can keep tract of all collections*/
schemas.push(collection);
/**
 Creating a custom Type for the schema that includes mongoose 'Document' type. 
 */

export type DemoModelType = mongoose.Model<DemoSchemaType> & {
  createDemo: (x: DemoTypes) => Promise<DemoSchemaType>;
};

export type DemoSchemaType = Document &
  DemoTypes & {
    /**Here we can add the 'methods' to the type so it can be used with intellisense.*/
    updateAge: (x: number) => Promise<DemoSchemaType>;
  };

/**Creating document template structure. */
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
  socketRoomId: {
    type: String,
    required: true,
  },
};

/** creating a mongodb  */
const demoSchema = new Schema<DemoSchemaType>(DemoOptions, {
  /**Added timestamp 'createAt' and 'updatedUp' */
  timestamps: true,
  /**Added sharded key for when database is sharded. */
  shardKey: { _id: 1 },
});

demoSchema.statics.createDemo = async function (data: DemoTypes) {
  try {
    const a_demo = new this(data);
    await a_demo.save();
    return a_demo;
  } catch (error) {
    console.log("demoSchema Error - CreateDemo", { error });
    throw error;
  }
};

/**
 * Adding method function to streamline productivity, here we can create functions that this document will do frequently.
 *
 * eg: This is a function that changes the age of a user.
 */
demoSchema.method("updateAge", async function (new_age: number) {
  try {
    this.age = new_age;
    await this.save();
    return this;
  } catch (error) {
    throw error;
  }
});

demoSchema.methods.updateName = async function () {
  //.. Another way to create a method function
};

/**Creating schema in database*/
const Demo = MainDb.model<DemoSchemaType, DemoModelType>(
  collection,
  demoSchema
);
/**Exporting schema to be used in application */
export default Demo;
