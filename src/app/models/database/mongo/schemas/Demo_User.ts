import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { MONGO_DEFAULT_DATABASE } from "../dbConnections";

/**Mongodb Document type */
import { Document } from "mongoose"; // Mongodb Document type
/**Importing type for this specific collection */
import { DemoTypes } from "../../types/Demo_Types";
/**Importing schemas array to push this schema's name to it. */
import { schemas } from "../../../../../config/mongo/config";
import DemoAccount from "./Demo_account";
import { getRandomNumber } from "../../../../utils/helpers";

const MainDb = MONGO_DEFAULT_DATABASE;
const Schema = mongoose.Schema;

const collection = "Demo_User";
/**Adding collection name to schemas array so we can keep tract of all collections*/
schemas.push(collection);
/**
 Creating a custom Type for the schema that includes mongoose 'Document' type. 
 */

export type DemoSchemaType = Document &
  DemoTypes & {
    /**Here we can add the 'methods' to the type so it can be used with intellisense.*/
    updateDOB: (x: Date) => Promise<DemoSchemaType>;
    updateName: (x: string) => Promise<DemoSchemaType>;
  };

export type DemoModelType = mongoose.Model<DemoSchemaType> & {
  createDemo: (x: DemoTypes) => Promise<DemoSchemaType>;
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
    unique: true,
    required: true,
    default: () => uuidv4(),
    immutable: true,
  },
};

/** creating a mongodb  */
const demoSchema = new Schema<DemoSchemaType>(DemoOptions, {
  /**Added timestamp 'createAt' and 'updatedUp' */
  timestamps: true,
  /**Added sharded key for when database is sharded. */
  shardKey: { _id: 1 },
});

/**Schema Static function, used to create a new document and other function alongside creating the document
 * This example creates a 'Demo' document and also creates a 'DemoAccount' document.
 */
demoSchema.statics.createDemo = async function (data: DemoTypes) {
  try {
    const a_demo = new this(data);
    await a_demo.save();
    /**Creating a new account when a user is created. */
    const new_demo_account = new DemoAccount({
      _id: uuidv4(),
      demo_id: a_demo._id,
      account: uuidv4(),
      balance: getRandomNumber(200000, 50000000),
    });
    await new_demo_account.save();

    // console.log({ new_demo_account });
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
demoSchema.method("updateDOB", async function (new_dob: Date) {
  try {
    this.dob = new_dob;
    const user_dob_year = this.dob.getFullYear();
    this.age = new Date().getFullYear() - user_dob_year;
    await this.save();
    return this;
  } catch (error) {
    throw error;
  }
});

/**Another way to create a method function */
demoSchema.methods.updateName = async function (new_name: string) {
  this.name = new_name;
  await this.save();
  return this;
};

/**Demo_User Schema
 * @description This collection has multiple built in functions such as methods and static which help to automate procedures.
 *
 * @example
 * // Using Static function which is on the Model level
 * // This creates a new Demo_User document and save it to the database.
 * const demo_static_result = await Demo_User.createDemo({
        _id: "co8379ch37egcvyivevcv",
        name: "Steve Jones",
        age: 32,
        dob: new Date("12/01/1992"),
        userType: "User",
      });
 * await demo_static_result.updateName("John Brown");


 * // Using a method(s) function which is on the Document level
 * const user = await Demo_User.findOne({_id: 1});
 * await user.updateName("John Brown");
 *
 *
 *
 */
const Demo_User = MainDb.model<DemoSchemaType, DemoModelType>(
  collection,
  demoSchema
);
/**Exporting schema to be used in application */
export default Demo_User;
