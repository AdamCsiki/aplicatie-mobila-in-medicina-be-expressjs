import Role from "./role";

export type UserModel = {
  id: number;
  email: String;
  password: String;
  username: String;
  firstName: String;
  lastName: String;
  roles: Role[];
};
