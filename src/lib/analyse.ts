import { STORE_LOCATION } from "../utils/constants";

import { getStreak } from "./algos/streak";
import { getCoverage, getIndexesWithMaxCoverage } from "./algos/coverage";
import { getQueryFieldTypes, getPositionDetails } from "../utils/query";
import { StoredIndexType, IndexDetailsType, JSObject, ContextType, AnalysisReport } from "../utils/types";


export const analyse = (context: ContextType) => {

	return async (
			collection: string,
			query: JSObject,
			sort: JSObject,
			projection: JSObject
		): Promise<ContextType> => {

			const indexes: StoredIndexType = await import(`${STORE_LOCATION}/${collection}.json`);

			const indexDetailsArr = indexes[collection].map((index) => {
				const indexDetailsObj:IndexDetailsType = {} ;
				indexDetailsObj['name'] = index.name;
				indexDetailsObj['key'] = index.key;
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

			const resultArr = bestIndexes.map(index => {

				let finalResult: AnalysisReport = {}; 

				const rangeFieldHops = index.keyWiseDetails.rangeHops.filter(key => key < index.keyWiseDetails.equalityMax);

				let hop: number = 0, rangeFields: string[] = [];
				for (let key in index.key) {
					if (rangeFieldHops.includes(hop)) {
						rangeFields.push(key);
					}
					hop += 1;
				}

				finalResult.indexName = index.name;

				if (index.coverage.uncoveredFields && index.coverage.uncoveredFields.length > 0) {
					// console.log(`Add the following fields to your query to use this index better:  ${index.coverage.uncoveredFields}`);
					finalResult.suggestion = "ADD_FIELDS";
					finalResult.fields = index.coverage.uncoveredFields;
				}

				if (rangeFields && rangeFields.length > 0) {
					// console.log(`The following range fields can be changed to equality fields: ${rangeFields}`);
					finalResult.suggestion = "CHANGE_OPERATION";
					finalResult.fields = rangeFields;
				}

				return finalResult;
			});

			context.report = resultArr;
			return Promise.resolve(context);
		}
}
