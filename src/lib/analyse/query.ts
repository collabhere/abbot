import {
	STORE_LOCATION
} from "../../utils/constants";

import { getQueryFieldTypes } from "../../utils/query";
import { StoredCollection, StoredIndex } from "../../utils/types";

import { Reporter } from "../reporter";
import { createAlgos, Algorithms } from "../algos";

const runQueryAnalysisForIndex = (
	algos: Algorithms,
	query: any,
	sort: any,
	projection: any
) => ({ name, key }: StoredIndex) => {

	const fieldTypes = getQueryFieldTypes(query, sort);

	algos.find.coverage(name, key, fieldTypes, projection);

	algos.find.position(name, key, fieldTypes);

	algos.find.streak(name, key, fieldTypes);
}

const getNewIndexSuggestions = (
	algos: Algorithms,
	query: any,
	sort: any,
) => (index: StoredIndex) => {

	const fieldTypes = getQueryFieldTypes(query, sort);

	algos.esr(fieldTypes);
}

export interface Analyse$Query {
	collection: string;
	query: any;
	sort?: any;
	projection?: any;
	conditions?: any;
};

export const analyseQuery = () => ({
	collection, query,
	sort, projection, conditions
}: Analyse$Query) => {

	const reporter = Reporter(
		collection, query,
		sort, projection,
	);

	const indexes: StoredCollection = require(`${STORE_LOCATION}/${collection}.json`);

	/* Filter indexes that will actually be used by mongo to support this query, i.e. indexes which have the first key in the query */
	const testableIndexes = indexes[collection].filter(index => (Object.keys(index.key) && Object.keys(index.key)[0]));

	const algos = createAlgos(reporter);

	if (testableIndexes && testableIndexes.length) {
		// Run analysis for each index and derive suggestions using report builder module.
		if (conditions && conditions.length) {
			reporter.context(query);

			testableIndexes.forEach((index) => {
				conditions.forEach((query: any) => {
					// Run analysis for each element in the 'ifs' array
					query.ifs.forEach((condition: any) => {
						runQueryAnalysisForIndex(algos, condition, sort, projection)(index);
					});
					runQueryAnalysisForIndex(algos, query.query, sort, projection)(index);
				});
			});
		}
		else {
			reporter.context(query);

			testableIndexes.forEach(
				runQueryAnalysisForIndex(algos, query, sort, projection)
			);
		}

	} else {
		reporter.context(query);

		// No indexes found to support this query.
		// Proceed to determining the most optimal index for this query by ESR.
		getNewIndexSuggestions(algos, query, sort);
	}
	
	reporter.report();
}