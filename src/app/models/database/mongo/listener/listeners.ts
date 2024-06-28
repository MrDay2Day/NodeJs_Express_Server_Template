import Demo from "../schemas/Demo";

/**
 * Here you can create listeners for your MongoDb instance to execute specific actions for a specified 'operationType' for a specified collection.
 */

export function MongoMainListener() {
  try {
    DemoListener();
  } catch (error) {
    console.log("MongoMainListener", { error });
  }
}

function DemoListener() {
  try {
    /** MongoDB Event Listener
     *
     *  Here we use the 'Demo' collection's 'watch' function.
     */
    Demo.watch().on("change", (change) => {
      console.log(change);
    });
  } catch (error) {
    console.log("DemoListener", { error });
  }
}
