export enum UserType {
  Admin = "Admin",
  User = "User",
  Visitor = "Visitor",
}

export type DemoTypes = {
  _id: string;
  name: string;
  age?: number;
  dob: Date;
  userType: UserType;
  socketRoomId?: string;
};

export type DemoAccountTypes = {
  _id: string;
  demo_id: string;
  account: number;
  balance: number;
};

export type ErrorType = Error &
  any & {
    msg?: string;
    code?: string;
    valid: false;
    [key: string]: any;
  };
