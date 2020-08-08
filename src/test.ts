/* Temp file for early development */

import Abbot from "./index"

import { Mongoose } from "mongoose";

import {analyseUsableIndexes} from './lib/analyse-indexes';

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


	// Test for index analysis
	const query = {
		flgUseStatus: 1,
		company: 'someCompany',
		status: {$in: ['abc', 'def']}
	}

	const sort = {
		username: 1
	}

	await analyseUsableIndexes("mailtrackingdetails", query, sort, null);
})();
