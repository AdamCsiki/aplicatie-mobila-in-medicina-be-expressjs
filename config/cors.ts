import { CorsOptions } from "cors";

const cors = require("cors");

const corsOptions: CorsOptions = {
	origin: "**",
	optionsSuccessStatus: 200,
};

module.exports = () => cors(corsOptions);
