import { BodyParser } from "body-parser";
import { NextFunction, Request, Response } from "express";
import cors from "./config/cors";
import logger from "./middleware/logger";
import process from "process";
import cookieJwtAuth from "./middleware/cookieJwtAuth";

process.env.MY_SECRET = "hello";

// ! BEFORE READING ANY COMMENTS MAKE SURE TO INSTALL THE Improved Comments PLUGIN

const PORT = 8080;
const express = require("express");

const bodyParser: BodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();

// !
// ! Express setup begins here
// !

// * Global headers set up here
// ? The global headers are set up in this file because i could not find a way to put it in another file without being similar
app.use((req: Request, res: Response, next: NextFunction) => {
	res.header({
		"Content-Type": "application/json",
		Connection: "keep-alive",
		Accept: "*/*",
	});
	// ! if error about header set after it was sent, it means that two responses were sent
	next();
});

// ? Body parser is used in order for the body of the request to be used, otherwise it is always undefined.
// ? Logger is used for logging when requests are made
// ? Cors is used in order to set up Cross Origin requests
// ? CookieParser is used for the JWToken requests
// ? Public is exposed staticly for absolutely no reason, it's just one line, won't hurt right?
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger);
app.use(cors());
app.use(cookieParser());

// ! Routes begins here
// ? User route handles all the requests for the user table
// ? Product route handles all the requests for the products table
// ? Auth route handles the login and register features of the application
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");

// ! Applying the routes and the route specific middleware
// ? The users route uses cookieJwtAuth to check if a token is present on the request
app.use("/users", cookieJwtAuth);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/noauth", express.static("public/noauth.html"));

// ! Express Server starts here
// ? It clears the console on start to stop text spam
// ? Shows the port and gives a link for ease of access
app.listen(PORT, () => {
	console.clear();
	console.log(`CORS-enabled web server listening on port ${PORT}`);
	console.log(`Link is here: http://localhost:${PORT}`);
});
