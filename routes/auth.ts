import { Response, Request, Router } from "express";
import LoginUser from "../models/loginUser";
import process from "process";
import {FieldInfo, MysqlError} from "mysql";
import {UserModel} from "../models/userModel";
import RegisterUser from "../models/registerUser";

const connection = require("../db/mysql");

const express = require("express");
const jwt = require("jsonwebtoken");
const router: Router = express.Router();



// ! POST route for Login
router.post("/login", (req: Request, res: Response) => {
	if (!(req.body.email && req.body.password)) {
		res.status(401);
		res.json({
			success: false,
			msg: "Forbidden.",
		});
		return;
	}

	const loginUser: LoginUser = req.body;

	// ? Query for checking if the user exists
	// ? Using placeholder ? to prevent sql injection
	const query = "SELECT * FROM users WHERE email = ? AND pass = ? LIMIT 1;"

	connection.query(query, [loginUser.email, loginUser.password], (err: MysqlError, rows: any) => {
		if(err) {
			res.json({
				success: false,
				error: err
			})

			return;
		}

		if(rows.length == 0) {
			res.json({
				success: false,
				error: "User doesn't exist."
			})
			return;
		}

		delete loginUser.password;

		// ? Creating the tokens using the JWT package
		// ? It uses the users email and servers password to create the tokens
		const token = jwt.sign(loginUser, process.env.MY_SECRET, { expiresIn: "5m" });
		const refreshToken = jwt.sign(loginUser, process.env.MY_SECRET_REFRESH, {
			expiresIn: "90d",
		});

		// ? Adding the refreshToken for the user
		res.cookie("refresh", refreshToken, {
			httpOnly: true,
		});

		// ? Also adding the user token in the response
		res.json({
			success: true,
			msg: "User has logged in succesfully.",
			token: token,
		});
	});

});

// ! POST route for SignUp
// ? First it checks if a user with the registered email exists
// ? If not then it makes another query to insert the new user
router.post("/signup", (req: Request, res: Response) => {
	const registerUser: RegisterUser = req.body;

	const checkQuery = "SELECT * FROM users WHERE email = ?";

	connection.query(checkQuery, [registerUser.email], (err: MysqlError, rows: any[]) => {
		if(rows.length > 0) {
			res.status(401);
			res.json({
				success: false,
				msg: "User already exists."
			})
			return;
		}

		const query = "INSERT INTO users (email, pass, first_name, last_name) VALUES (?, ?, ?, ?)";

		connection.query(query, [registerUser.email, registerUser.password, registerUser.firstName, registerUser. lastName], (err: MysqlError) => {
			if (err) {
				res.status(401);
				res.json({
					success: false,
					msg: err
				})
				return;
			}

			res.status(200);
			res.json({success: true, msg: "User has been created."})
		})
	})


});

// ! GET route for requesting new Refresh and User Tokens
// ? Usually used automatically if the user has an expired token, but has a valid refresh token
router.get("/refresh", (req: Request, res: Response) => {
	const refreshToken = req.cookies.refresh;

	if (refreshToken) {
		const jwtUser = jwt.verify(refreshToken, process.env.MY_SECRET_REFRESH);

		const token = jwt.sign(
			{ email: jwtUser.email },
			process.env.MY_SECRET,
			{
				expiresIn: "5m",
			}
		);

		const newRefreshToken = jwt.sign(
			{ email: jwtUser.email },
			process.env.MY_SECRET_REFRESH,
			{ expiresIn: "90d" }
		);

		res.clearCookie("refresh", { httpOnly: true });

		res.cookie("refresh", newRefreshToken, { httpOnly: true });

		res.json({
			success: true,
			msg: "Refresh succesfull",
			token: token,
		});

		return;
	}

	res.status(401).json({
		success: false,
		msg: "Refresh unsuccesfull",
	});
});

module.exports = router;
