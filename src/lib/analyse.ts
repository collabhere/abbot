import { STORE_LOCATION } from "../utils/constants";

import { getQueryFieldTypes } from "../utils/query";
import { StoredCollection, StoredIndex } from "../utils/types";
import { convertQueryExpressions, convertIfsToQueries } from "../utils/conditions";
import { Reporter } from "./reporter";
import { createAlgos, Algorithms } from "./algos";

const runQueryAnalysisForIndex = (
	algos: Algorithms,
	query: any,
	sort: any,
	projection: any
) => ({ name, key }: StoredIndex) => {

	const fieldTypes = getQueryFieldTypes(query, sort);

	algos.coverage(name, key, fieldTypes, projection);

	algos.position(name, key, fieldTypes);

	algos.streak(name, key, fieldTypes);
}

const getNewIndexSuggestions = (
	algos: Algorithms,
	query: any,
	sort: any,
) => ({ name, key }: StoredIndex) => {

	const fieldTypes = getQueryFieldTypes(query, sort);

	algos.newIndexes(fieldTypes);
}

export interface Analyse$Query {
	collection: string;
	query: any;
	sort?: any;
	projection?: any;
	conditions?: any
};

const analyseQuery = (reporter: Reporter) => async ({
	collection, query,
	sort, projection, conditions
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
		if (conditions && conditions.length) {
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
			testableIndexes.forEach(
				runQueryAnalysisForIndex(algos, query, sort, projection)
			);
		}

	} else {
		// No indexes found to support this query.
		// Proceed to determining the most optimal index for this query by ESR.
		getNewIndexSuggestions(algos, query, sort);
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
		query: middleware(analyseQuery(reporter), 'query'),
		count: () => () => { },
		aggregation: middleware(analyseQuery(reporter), 'aggregation'),
		report: reporter.report
	};
}


export const middleware = (func: any, type: any) => (...args: any) => {

	if (type === 'query') {
		args[0].conditions = convertQueryExpressions(args.query);
	} else {
		// @todo: write aggregations logic
	}

	return func(...args);
}

