import Permission from "./permissions";
import Roles from "./roles";

interface Role {
	name: Roles;
	permissions: Permission[];
}

export default Role;
