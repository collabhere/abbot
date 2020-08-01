import { Mongoose } from "mongoose";

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from "fs";
import { STORE_LOCATION } from "../utils/constants";
import { fstat } from "fs";

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
		await mkdir(STORE_LOCATION/* , { recursive: true } */ /* <- seems unsafe  */);
	}

	await Promise.all(collections.map(async collection => {
		const indexes = await mongoose.model(collection).listIndexes() as unknown as ListIndexesResult;

		const obj = {
			[collection]: indexes.map(({ key, name }) => ({ key, name }))
		};

		await writeFile(`${STORE_LOCATION}/${collection}.json`, JSON.stringify(obj));
	}));
}

export async function getIndexes(
	client: Mongoose,
	collections: string[] | undefined
) {
	if (!collections || collections.length === 0) {
		throw new Error("[prepare][get-indexes] Please provide a list of collections to test against.");
	}

	if (client.connection.readyState !== 1) { // Not connected
		client.connection.on("connect", async function () {
			await fetch(client, collections);
		});
	} else {
		await fetch(client, collections);
	}
}
