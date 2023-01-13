import { Response, Request, Router, NextFunction } from "express";
import User from "../models/user";
import Roles from "../models/roles";
import cookieJwtAuth from "../middleware/cookieJwtAuth";
import connection from "../db/mysql";

connection.connect();

const express = require("express");
const router: Router = express.Router();

router
	.route("/")
	.get((req: Request, res: Response) => {
		connection.query("SELECT * FROM app_user;", (err, rows, fields) => {
			if (err) {
				console.log("Error: ", err);
			}
			res.json(rows);
		});

		res.status(200);
	})
	.post((req: Request, res: Response) => {
		const user: User = req.body;
		if (!user) {
			console.log("User missing, ", user);
		}

		connection.query("");
	});

router.get("/new", cookieJwtAuth, (req: Request, res: Response) => {
	res.send("User new user");
});

router
	.route("/:id")
	.get(cookieJwtAuth, (req: Request, res: Response) => {
		connection.query(
			`SELECT * FROM app_user WHERE id=${req.params.id}`,
			(err, rows, fields) => {
				if (err) {
					throw err;
				}

				if (rows.length == 0) {
					console.log(`No user with ${req.params.id} exists.`);
					res.status(404);
				}

				res.json(rows);
			}
		);

		res.status(200);
	})
	.put(cookieJwtAuth, (req: Request, res: Response) => {
		res.send(`Update user with ID: ${req.params.id}`);
	})
	.delete(cookieJwtAuth, (req: Request, res: Response) => {
		res.send(`Delete user with ID: ${req.params.id}`);
	});

const users: User[] = [
	{
		email: " ",
		password: " ",
		username: " ",
		firstName: " ",
		lastName: " ",
		roles: [{ name: Roles.ROLE_USER, permissions: [] }],
	},
];

router.param(
	"id",
	(req: Request, res: Response, next: NextFunction, id: any) => {
		console.log(users[id]);
		next();
	}
);

module.exports = router;
