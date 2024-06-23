export enum UserType {
  Admin = "Admin",
  User = "User",
  Visitor = "Visitor",
}

export type DemoTypes = {
  id?: string;
  name: string;
  age?: number;
  dob: Date;
  userType: UserType;
};
