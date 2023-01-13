import Role from "./role";

interface User {
	email: String;
	password: String;
	username: String;
	firstName: String;
	lastName: String;
	roles: Role[];
}

export default User;
