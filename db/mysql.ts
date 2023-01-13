import { Connection } from "mysql";

const mysql = require("mysql2");

const connection: Connection = mysql.createConnection({
	host: "localhost",
	user: "medappuser",
	password: "medapppassword10",
	database: "medapp_be",
});

export default connection;
