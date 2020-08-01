import { Mongoose } from "mongoose";

import { writeFile, mkdir } from '../utils/fs';

async function fetch(
	mongoose: Mongoose
) {
	const collections = await mongoose.connection.db.listCollections().toArray();

	await mkdir('indexStore', { recursive: true });

	await Promise.all(collections.map(async (collection) => {
		const indexes: any = await mongoose.model(collection.name, new mongoose.Schema({}, { strict: false })).listIndexes();
		const collName = indexes[0].ns.split('.')[1];
		const indexObj = new Object();
		const finalArr = indexes.map((index) => {
			return { key: index.key, name: index.name };
		});

		indexObj[collName] = finalArr;

		let finalJson = JSON.stringify(indexObj);

		await writeFile(`indexStore/${collName}.json`, finalJson);
	}));
}

export async function getIndexes(
	client: Mongoose
) {
	if (client.connection.readyState !== 1) { // Not connected
		client.connection.on("connect", async function () {
			await fetch(client);
		});
	} else {
		await fetch(client);
	}
}
