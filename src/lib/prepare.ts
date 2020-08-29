import { MongoClient } from "mongodb";
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
	mongoClient: MongoClient,
	collections: string[]
) {
	if (!existsSync(STORE_LOCATION)) {
		await fs.mkdir(STORE_LOCATION/* , { recursive: true } */ /* <- seems unsafe  */);
	}

	await Promise.all(collections.map(async collection => {
		const indexes = await mongoClient.db().collection(collection).indexes() as unknown as ListIndexesResult;

		const obj = {
			[collection]: indexes.map(({ key, name }) => ({ key, name }))
		};

		await fs.writeFile(`${STORE_LOCATION}/${collection}.json`, JSON.stringify(obj));
	}));
}

async function prepareStore(
	uri: string,
	collections: string[] | undefined
) {
	if (!collections || collections.length === 0) {
		throw new Error("[prepare][store] Please provide a list of collections to test against.");
	}

	const client = await createConnection(uri);

	if (!client.isConnected()) { // Not connected
		// await new Promise((resolve, reject) => {
		// 	client.connection.on("connected", async function () {
		// 		await fetch(client, collections);
		// 		resolve();
		// 	});
		// 	client.connection.on("error", function(err) {
		// 		reject(err);
		// 	});
		// }); // @todo: Above
		throw new Error("[prepare][store] Connection to MongoDB failed! Please check your connection-string.");
	} else {
		await fetch(client, collections);
	}

	client.close();
}


export const Prepare = (context:Context)  => async (
	opts: PrepareOptions
) => {

	Object.assign(context, opts);

	validateContext(context);
	
	await prepareStore(opts.mongoUri, opts.collections); // Make this conditional in the future

	return Abbot(context);
}


const createConnection = async (
	uri: string
): Promise<MongoClient> => {
	const client = new MongoClient(uri);
	await client.connect();
	return client;
}