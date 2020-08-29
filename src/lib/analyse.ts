import { STORE_LOCATION } from "../utils/constants";

import { getQueryFieldTypes } from "../utils/query";
import { StoredCollection, StoredIndex } from "../utils/types";
import { Reporter } from "./reporter";
import { createAlgos, Algorithms } from "./algos";

const runQueryAnalysisForIndex = (
	algos: Algorithms,
	query: any,
	sort: any,
	projection: any
) => ({ name, key }: StoredIndex) => {

	const fieldTypes = getQueryFieldTypes(query, sort);

	algos.coverage(name, key, fieldTypes);

	algos.position(name, key, fieldTypes);

	algos.streak(name, key, fieldTypes);
}

export interface Analyse$Query {
	collection: string;
	query: any;
	sort?: any;
	projection?: any;
};

const analyseQuery = (reporter: Reporter) => async ({
	collection, query,
	sort, projection
}: Analyse$Query) => {

	const algos = createAlgos(reporter);

	reporter.setup(
		collection, query,
		sort, projection,
	)

	const indexes: StoredCollection = await import(`${STORE_LOCATION}/${collection}.json`);

	/* Fitler indexes that will actually be used by mongo to support this query, i.e. indexes which have the first key in the query */
	const testableIndexes = indexes[collection].filter(index => (Object.keys(index.key) && Object.keys(index.key)[0]));

	if (testableIndexes && testableIndexes.length) {
		// Run analysis for each index and derive suggestions using report builder module.
		testableIndexes.forEach(
			runQueryAnalysisForIndex(algos, query, sort, projection)
		);

	} else {
		// No indexes found to support this query.
		// Proceed to determining the most optimal index for this query by ESR.
	}
}

/**
 * 
 * @param collection 
 * @param query 
 * @param sort 
 * @param projection 
 */
export const Analyse = () => {
	const reporter = Reporter();
	return {
		query: analyseQuery(reporter),
		count: () => () => { },
		aggregation: () => () => { },
		report: reporter.report
	};
}
