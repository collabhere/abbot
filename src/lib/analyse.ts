import { STORE_LOCATION } from "../utils/constants";

import { getQueryFieldTypes } from "../utils/query";
import { StoredCollection, StoredIndex } from "../utils/types";
import { convertQueryExpressions } from "../utils/conditions";
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

const getNewIndexSuggestions = (
	algos: Algorithms,
	query: any,
	sort: any,
	projection: any
) => ({ name, key }: StoredIndex) => {

	const fieldTypes = getQueryFieldTypes(query, sort);

	algos.newIndexes(fieldTypes);
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

	/* Filter indexes that will actually be used by mongo to support this query, i.e. indexes which have the first key in the query */
	const testableIndexes = indexes[collection].filter(index => (Object.keys(index.key) && Object.keys(index.key)[0]));

	if (testableIndexes && testableIndexes.length) {
		// Run analysis for each index and derive suggestions using report builder module.
		testableIndexes.forEach((index) => {
			const finalQueries = convertQueryExpressions(query);
			finalQueries.forEach((query) => {
				if (query.ifs) {
					// @todo: Run analysis for 'ifs' separately
				}

				runQueryAnalysisForIndex(algos, query.query, sort, projection)(index);
			});
		});

	} else {
		// No indexes found to support this query.
		// Proceed to determining the most optimal index for this query by ESR.
		getNewIndexSuggestions(algos, query, sort, projection);
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
