import { Document } from "mongoose";
import { DemoSchemaType, UserType } from "../database/mongo/schemas/Demo";

// Object-Oriented approach with MongoDB Documents.

class DemoClass extends Document {
  name: string;
  age?: number | undefined;
  dob: Date;
  userType: UserType;
  constructor(
    name: string,
    age: number | undefined,
    dob: Date,
    userType: UserType
  ) {
    super();
    this.name = name;
    this.age = age;
    this.dob = dob;
    this.userType = userType;
  }

  static fromDocument(doc: DemoSchemaType): DemoClass {
    return new DemoClass(doc.name, doc.age, doc.dob, doc.userType);
  }

  async updateAge(new_age: number) {
    this.age = new_age;
    this.save();
  }
}

/**
import Demo from "../database/mongo/schemas/Demo";
import { DemoClass } from "./path/to/DemoClass";

async function example() {
  // Find a document in the MongoDB collection
  const demoDoc = await Demo.findById("some-id");

  if (demoDoc) {
    // Create an instance of DemoClass from the document
    const demoInstance = DemoClass.fromDocument(demoDoc);

    // Now you can use all Mongoose document methods on demoInstance
    console.log(demoInstance.name); // Access custom property
    demoInstance.save(); // Use Mongoose document method
  }
}

 */

export { DemoClass };
