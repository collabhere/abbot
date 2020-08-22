/* Temp file for early development */

import Abbot from "./index"

import { Mongoose } from "mongoose";

import {analyse} from './lib/analyse';

const instance = new Mongoose();

(async function main() {
	// const abbot = await Abbot.prepare({
	// 	mongooseInstance: instance,
	// 	collections: ["unicorns"]
	// });
	// // OR const { abbot } = Abbot;

	// await abbot({
	// 	collection: "unicorns",
	// 	query: {
	// 		shiny: true
	// 	}
	// }).exec();


	// Test for index analysis
	const query = {
		flgUseStatus: 1,
		company: {$in: ['abc', 'def']},
		status: {$in: ['abc', 'def']},
		cadenceId: 'id'
	}

	await analyse("mailtrackingdetails", query, null, null);
})();
