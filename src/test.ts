/* Temp file for early development */

import Abbot from "./index"

import { Mongoose, Schema } from "mongoose";

const instance = new Mongoose();

const URI = "";

(async function main() {

	try {
		instance.model("unicorns", new Schema({
			"name": String,
			"shiny": Boolean,
			"hornLength": Number,
			"age": Number,
			"status": String
		}));
	
		await instance.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
		
		const abbot = await Abbot.prepare({
			mongooseInstance: instance,
			collections: ["unicorns"]
		});
	
		const query = {
			age: {
				$gte: 50,
				$lte: 150
			},
			hornLength: 50
		};
	
		await abbot({
			collection: "unicorns",
			query
		}).exec();
		
		instance.disconnect();
	} catch(err) {
		console.error(err);
		instance.disconnect();
	}
	
})();
