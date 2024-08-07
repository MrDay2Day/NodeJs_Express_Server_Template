import {
  getRandomNumber,
  generateString,
  getRandomElement,
} from "../utils/helpers";

/**
 * An object representing a task with its expiry date and action to be performed.
 * @typedef {Object} TaskTypes
 * @property {T} task - The task to be executed.
 * @property {Date} expiryDate - The date and time at which the task should expire.
 * @property {(task: T) => R} action - The function to be executed when the task expires.
 */
interface TaskTypes<T, R> {
  task: T;
  expiryDate: Date;
  action: (task: T) => R;
}

/**
 * A class to manage and schedule tasks based on their expiry dates.
 * @typedef {Object} TaskTypes
 * @property {string} task - The name of the task.
 * @property {Date} expiryDate - The date and time at which the task should expire.
 * @property {function(task: T): R} action - The function to be executed when the task expires.
 */

export default class TaskScheduler<T, R> {
  /**
   * @type {number}
   * @private
   */
  checkInterval: number;
  /**
   * @type {TaskTypes<T>[]}
   * @private
   */
  tasks: TaskTypes<T, R>[];
  /**
   * Creates a new TaskScheduler instance.
   *
   * Internally sets the check interval to 1 second (1000 milliseconds) and initializes the interval check.
   */
  constructor() {
    this.tasks = [];
    this.checkInterval = 1000; // Check every second
    this.init();
  }

  /**
   * Adds a new task to the scheduler.
   *
   * @param {T} task - The name of the task.
   * @param {Date} expiryDate - The date and time at which the task should expire.
   * @param {(task: T) => R} action - The function to be executed when the task expires.
   */
  addTask(task: T, expiryDate: Date, action: (task: T) => R) {
    this.tasks.push({ task, expiryDate, action });
  }

  removeTask(task: T) {
    this.tasks = this.tasks.filter((taskObj) => {
      if (JSON.stringify(taskObj.task) === JSON.stringify(task)) {
        console.log(`REMOVED`, { removedTask: taskObj });
        return false;
      }
      return true;
    });
  }

  /**
   * Initializes the interval check for expired tasks.
   *
   * @private
   */
  private init() {
    setInterval(() => this.checkTasks(), this.checkInterval);
  }

  /**
   * Checks for expired tasks and executes their associated actions.
   *
   * Removes expired tasks from the internal list.
   *
   * @private
   */
  checkTasks() {
    const now = new Date();

    this.tasks = this.tasks.filter((taskObj) => {
      if (now >= taskObj.expiryDate) {
        taskObj.action(taskObj.task); // Perform the action
        return false; // Remove the task from the list
      }
      return true; // Keep the task if not expired
    });
  }

  private approximateSize(obj: TaskTypes<T, R>[] | T | string | number | any) {
    const type = typeof obj;
    let size: number = 0;

    if (obj instanceof Array) {
      obj.forEach((e) => (size += this.approximateSize(e)));
    } else if (typeof obj === "string") {
      size = obj.length * 2; // Assuming 2 bytes per character (UTF-16)
    } else if (type === "object" && typeof obj === "object") {
      // Loop through object properties and estimate sizes recursively
      for (const key in obj) {
        if (obj && key && typeof key === "string") {
          const tempt: TaskTypes<T, R>[] | T | string | number = obj[key];
          if (typeof tempt === "string") size += this.approximateSize(tempt);
        }
      }
      // Add overhead for object structure (rough estimate)
      size += 16; // Adjust based on your understanding of object overhead
    } else if (typeof obj === "number" || typeof obj === "boolean") {
      size = 8; // Assuming 8 bytes for doubles and booleans
    }

    return size;
  }

  sizeInMemory(): number {
    return this.approximateSize(this.tasks);
  }
}

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
// EXAMPLES
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

// EXAMPLE 1

/**
 * This Type declaration represents the type of the task in the cron. By default the type is string however the type can be set to anything.
 */
type SingleTask = string;
/**
 * This Type declaration represents the type of data from the cron action when a task has expired. By default the type is void however the type can be set to anything depending on the action function.
 */
type TaskFuncReturn = void;

// Create an instance of TaskScheduler, multiple instances can be created.
const scheduler = new TaskScheduler<SingleTask, TaskFuncReturn>();

// Define a task action to be done when when a task has expired. Node the use of the "SingleTask" type.
function myAction(task: SingleTask): TaskFuncReturn {
  // To display the size in memory of the task array.
  console.log(
    `Scheduler - Size in memory: ${(scheduler.sizeInMemory() / 1048576).toFixed(
      2
    )}MB`
  );
  console.log(`Task "${task}" has expired and the action is performed.`);
}

// Add a task with an expiry date 5 seconds from now
for (let x = 0; x < 2000; x++) {
  const expiryDate = new Date(Date.now() + getRandomNumber(5000, 120000)); // 5 seconds from now
  scheduler.addTask(`Example Task ${x + 1}`, expiryDate, myAction);
}

console.log(
  // To display the size in memory of the task array per second.
  `Scheduler - Size in memory: ${(scheduler.sizeInMemory() / 1048576).toFixed(
    2
  )}MB`
);

// Example of removing a task before it has expire.
scheduler.removeTask("Example Task 28");

///////////////////////////////////////////////////////////////////////////////////////////
// EXAMPLE 2

/**
 * Represents a single task type with name, age, and gender properties.
 * @typedef {Object} SingleTaskType
 * @property {string} name - The name of the task.
 * @property {number} age - The age of the task.
 * @property {string} gender - The gender of the task.
 */
type SingleTaskType = {
  name: string;
  age: number;
  gender: string;
};
/**
 * Defines the return type for a task function as SingleTaskType.
 * @typedef {SingleTaskType} TaskFuncReturnType
 */
type TaskFuncReturnType = SingleTaskType;

// Create an instance of TaskScheduler, multiple instances can be created.
const reminder = new TaskScheduler<SingleTaskType, TaskFuncReturnType>();

// Define a task action to be done when when a task has expired. Node the use of the "SingleTaskType" type.
function myFinalAction(reminderEle: SingleTaskType): TaskFuncReturnType {
  // To display the size in memory of the task array.
  console.log(
    `Reminder - Size in memory: ${(reminder.sizeInMemory() / 1048576).toFixed(
      2
    )}MB`
  );
  console.log(`Patient Reminder`, reminderEle);
  return reminderEle;
}

// Add a task with an expiry date between 5 seconds to 2 minutes from now
for (let x = 0; x < 2000; x++) {
  const expiryDate = new Date(Date.now() + getRandomNumber(5000, 120000)); // 5 seconds from now
  reminder.addTask(
    {
      name: generateString(getRandomNumber(6, 20)),
      age: getRandomNumber(18, 72),
      gender: getRandomElement<string>(["Male", "Female"]) as string,
    },
    expiryDate,
    myFinalAction
  );
}

console.log(
  // To display the size in memory of the task array per second.
  `Reminder - Size in memory: ${(reminder.sizeInMemory() / 1048576).toFixed(
    2
  )}MB`
);

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
// End of Examples
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
