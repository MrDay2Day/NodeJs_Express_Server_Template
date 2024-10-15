import { faker } from "@faker-js/faker";
import { UserType } from "../models/database/types/Demo_Types";

export function generate_user() {
  const demo_user = {
    _id: faker.string.uuid(),
    userId: faker.string.uuid(),
    username: faker.internet.userName(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    full_name: faker.person.fullName(),
    name: faker.person.fullName(),
    phone: parseInt(`1876${faker.string.numeric("#######")}`),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    dob: faker.date.birthdate(),
    registeredAt: faker.date.past(),
    userType: UserType.User,
    age: 0,
  };
  const user_dob_year = demo_user.dob.getFullYear();
  demo_user.age = new Date().getFullYear() - user_dob_year;
  return demo_user;
}
