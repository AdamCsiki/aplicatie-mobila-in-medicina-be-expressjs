import { Request, Response, NextFunction } from "express";

const jwt = require("jsonwebtoken");

function cookieJwtAuth(req: Request, res: Response, next: NextFunction) {
	console.log("CookieJwtAuth called.");
	const token = req.cookies.token;
	try {
		const user = jwt.verify(token, process.env.MY_SECRET);
		console.log("User: ", user);

		req.body = user;

		next();
	} catch (err) {
		res.status(403);
		return res.redirect("/noauth");
	}
}

export default cookieJwtAuth;
