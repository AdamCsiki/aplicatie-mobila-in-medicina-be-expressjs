import { CorsOptions } from "cors";

const cors = require("cors");

const corsOptions: CorsOptions = {
	origin: "**",
	optionsSuccessStatus: 200,
};

export default () => cors(corsOptions);
