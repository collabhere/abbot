import { STORE_LOCATION } from "../utils/constants";

import { getStreak } from "./algos/streak";
import { getCoverage, getIndexesWithMaxCoverage } from "./algos/coverage";
import { getQueryFieldTypes, getPositionDetails } from "../utils/query";
import { StoredIndexType } from "../utils/types";

export const analyse = async (
	collection: string,
	query: {},
	sort: {},
	projection: {}
) => {

	const indexes: StoredIndexType = await import(`${STORE_LOCATION}/${collection}.json`);

	const indexDetailsArr = indexes[collection].map((index: { key: {}, name: string }) => {
		const indexDetailsObj = new Object();
		indexDetailsObj['name'] = index.name;
		indexDetailsObj['keys'] = index.key;
		if (Object.keys(query).includes(Object.keys(index.key)[0])) {
			const queryFieldTypes = getQueryFieldTypes(query, sort);
			indexDetailsObj['coverage'] = getCoverage(index.key, queryFieldTypes);
			indexDetailsObj['keyWiseDetails'] = getPositionDetails(index.key, queryFieldTypes);
			indexDetailsObj['fieldStreak'] = getStreak(index.key, queryFieldTypes);
		} else {
			indexDetailsObj['coverage'] = null;
			indexDetailsObj['keyWiseDetails'] = null;
			indexDetailsObj['fieldStreak'] = null;
		}
		return indexDetailsObj;
	});

	const bestIndexes = getIndexesWithMaxCoverage(indexDetailsArr);

	bestIndexes.forEach(
		(index: {
			name: string,
			keys: {},
			coverage: any,
			fieldStreak: number,
			keyWiseDetails: { rangeHops: number[], equalityMax: number }
		}) => {

			const rangeFieldHops = index.keyWiseDetails.rangeHops.filter(key => key < index.keyWiseDetails.equalityMax);

			let hop: number = 0, rangeFields: string[] = [];
			for (let key in index.keys) {
				if (rangeFieldHops.includes(hop)) {
					rangeFields.push(key);
				}
				hop += 1;
			}

			console.log(index.name);
			if (index.coverage.uncoveredFields && index.coverage.uncoveredFields.length > 0)
				console.log(`Add the following fields to your query to use this index better:  ${index.coverage.uncoveredFields}`);

			if (rangeFields && rangeFields.length > 0)
				console.log(`The following range fields can be changed to equality fields: ${rangeFields}`);


			console.log('\n');
		});
}
