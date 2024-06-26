import Demo from "../schemas/Demo";

export function MongoMainListener() {
  try {
    DemoListener();
  } catch (error) {
    console.log("MongoMainListener", { error });
  }
}

function DemoListener() {
  try {
    // MongoDB Event Listener
    Demo.watch().on("change", (change) => {
      console.log(change);
    });
  } catch (error) {
    console.log("DemoListener", { error });
  }
}
