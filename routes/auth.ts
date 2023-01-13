import { Response, Request, NextFunction, Router } from "express";
import LoginUser from "../models/loginUser";
import process from "process";

const express = require("express");
const jwt = require("jsonwebtoken");
const router: Router = express.Router();

const pass = "miau";

router.post("/login", (req: Request, res: Response) => {
	if (!(req.body.email && req.body.password)) {
		res.status(401).json({
			success: false,
			msg: "Forbidden.",
		});
		return;
	}

	let user: LoginUser = req.body;

	if (user.password !== pass) {
		res.status(403).json({
			success: false,
			msg: "Invalid login.",
		});
		return;
	}

	delete user.password;

	const token = jwt.sign(user, process.env.MY_SECRET, { expiresIn: "1H" });

	res.cookie("token", token, {
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		msg: "User has logged in succesfully.",
		token: token,
	});

	return res.redirect("/");
});

router.post("/register", (req: Request, res: Response) => {});

module.exports = router;
