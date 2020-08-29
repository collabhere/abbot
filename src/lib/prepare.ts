import { MongoClient } from "mongodb";
import { promises as fs, existsSync } from 'fs';

import { PrepareOptions } from '../utils/types';
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

	await fetch(client, collections);

	await client.close();
}


export const Prepare = async (
	opts: PrepareOptions
) => {
	await prepareStore(opts.mongoUri, opts.collections);
}


const createConnection = async (
	uri: string
): Promise<MongoClient> => {
	const client = new MongoClient(uri);
	await client.connect();
	return client;
}