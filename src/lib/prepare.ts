import { Mongoose } from "mongoose";
import { promises as fs, existsSync } from 'fs';

import { Abbot } from "./abbot";

import { Context, PrepareOptions } from '../utils/types';
import { validateContext } from "../utils/query";
import { STORE_LOCATION } from "../utils/constants";

type ListIndexesResult = {
	name: string;
	key: string;
	ns: string;
}[];

async function fetch(
	mongoose: Mongoose,
	collections: string[]
) {
	if (!existsSync(STORE_LOCATION)) {
		await fs.mkdir(STORE_LOCATION/* , { recursive: true } */ /* <- seems unsafe  */);
	}

	await Promise.all(collections.map(async collection => {
		const indexes = await mongoose.model(collection).listIndexes() as unknown as ListIndexesResult;

		const obj = {
			[collection]: indexes.map(({ key, name }) => ({ key, name }))
		};

		await fs.writeFile(`${STORE_LOCATION}/${collection}.json`, JSON.stringify(obj));
	}));
}

async function prepareStore(
	client: Mongoose,
	collections: string[] | undefined
) {
	if (!collections || collections.length === 0) {
		throw new Error("[prepare][store] Please provide a list of collections to test against.");
	}

	if (client.connection.readyState !== 1) { // Not connected
		// await new Promise((resolve, reject) => {
		// 	client.connection.on("connected", async function () {
		// 		await fetch(client, collections);
		// 		resolve();
		// 	});
		// 	client.connection.on("error", function(err) {
		// 		reject(err);
		// 	});
		// }); // @todo: Above
		throw new Error("[prepare][store] Please connect the instance provided to the database before calling `.prepare()`");
	} else {
		await fetch(client, collections);
	}
}


export const Prepare = (context:Context)  => async (
	opts: PrepareOptions
) => {

	Object.assign(context, opts);

	validateContext(context);
	
	await prepareStore(opts.mongooseInstance, opts.collections); // Make this conditional in the future

	return Abbot(context);
}
