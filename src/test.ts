/* Temp file for early development */

import Abbot from "./index";

const URI = "";

(async function main() {

	try {
		await Abbot.prepare({
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

		const { analyse } = Abbot;

		await analyse.query({
			collection: "unicorns",
			query
		});

		await analyse.report({
			format: "txt",
			type: "file",
			path: __dirname + "/reports/report-" + Date.now() + ".txt"
		});

	} catch (err) {
		console.error(err);
	}

})();
