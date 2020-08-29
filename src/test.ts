/* Temp file for early development */

import Abbot from "./index";

const URI = "";

(async function main() {

	try {
		const abbot = await Abbot.prepare({
			mongoUri: URI,
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
	} catch(err) {
		console.error(err);
	}
	
})();
