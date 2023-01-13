import Role from "./role";

interface RegisterUser {
	email: String;
	password: String;
	username: String;
	firstName: String;
	lastName: String;
	roles: Role[];
}
