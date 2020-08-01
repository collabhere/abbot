/* Temp file for early development */

import Abbot from "./index"

import { Mongoose } from "mongoose";

const instance = new Mongoose();

(async function main() {
	const abbot = await Abbot.prepare({
		mongooseInstance: instance,
		collections: ["unicorns"]
	});
	// OR const { abbot } = Abbot;

	await abbot({
		collection: "unicorns",
		query: {
			shiny: true
		}
	}).exec();
})();
