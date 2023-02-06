import { Response, Request, Router } from "express";
import { FieldInfo, MysqlError } from "mysql";

const connection = require("../db/mysql");

const cookieJwtAuth = require("../middleware/jwtAuth");

const express = require("express");
const router: Router = express.Router();

router
	.route("/")
	.get((req: Request, res: Response) => {
		connection.query("SELECT * FROM users;", (err: MysqlError, rows: any) => {
			if (err) {
				res.status(500);
				res.json({
					success: false,
					error: err
				})
				return;
			}

			if(rows.length == 0) {
				res.status(404)
				res.end();
				return;
			}

			res.status(200);
			res.json(rows);
		});
	});

router
	.route("/user")
	.get((req: Request, res: Response) => {
		const query = "SELECT * FROM users WHERE id = ?";

		connection.query(
			query,
			[req.query.id],
			(err: MysqlError, rows: any) => {
				if (err) {
					res.status(401);
					res.json({
						success: false,
						error: err
					})
				}

				if (rows.length == 0) {
					res.status(404);
					res.json({
						success: false,
						msg: "User does not exist."
					})
				}

				res.status(200);
				res.json({
					user: rows[0]
				})
			}
		);
	})
	.put((req: Request, res: Response) => {
		res.send(`Update user with ID: ${req.params.id}`);
	})
	.delete((req: Request, res: Response) => {
		res.send(`Delete user with ID: ${req.params.id}`);
	});


module.exports = router;
