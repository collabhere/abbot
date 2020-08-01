/* Temp file for early development */

import Abbot from "./index"

import { Mongoose } from "mongoose";

const instance = new Mongoose();

const abbot = Abbot.prepare({ mongooseInstance: instance });
// OR const { abbot } = Abbot;

(async function main() {
	abbot({
		collection: "unicorns",
		query: {
			shiny: true
		}
	}).exec();
})();
