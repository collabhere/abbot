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

		const pipeline = [
			{ $match : { hornLength : 50, age: { $gte: 50, $lte: 150 }}},
			{ $group : { _id : '$hornLength', count : { $sum : 1 }}},
			{ $unwind : { path : "$age" }}
		]

		const { analyse } = Abbot;

		// await analyse.query({
		// 	collection: "unicorns",
		// 	query
		// });

		await analyse.aggregation({
			collection: "unicorns",
			pipeline
		})

		await analyse.report({
			format: "txt",
			type: "file",
			path: __dirname + "/reports/report-" + Date.now() + ".txt"
		});

	} catch (err) {
		console.error(err);
	}

})();
