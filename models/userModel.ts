import Role from "./role";

export type UserModel = {
	email: String;
	password: String;
	username: String;
	firstName: String;
	lastName: String;
	roles: Role[];
};
