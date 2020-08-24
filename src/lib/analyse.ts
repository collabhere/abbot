import { STORE_LOCATION } from "../utils/constants";

import { getQueryFieldTypes } from "../utils/query";
import { StoredCollection, StoredIndex, JSObject, Context } from "../utils/types";
import { Reporter } from "./reporter";
import { createAlgos, Algorithms } from "./algos";

const runQueryAnalysisForIndex = (
	algos: Algorithms,
	query: JSObject,
	sort: JSObject,
	projection: JSObject
) => ({ name, key }: StoredIndex) => {

	const fieldTypes = getQueryFieldTypes(query, sort);

	algos.coverage(name, key, fieldTypes);

	algos.position(name, key, fieldTypes);

	algos.streak(name, key, fieldTypes);
}

/**
 * Analyse
 * @param { Context } context Execution context of abbot
 */
export const analyse = (context: Context) => async (
	collection: string,
	query: JSObject,
	sort: JSObject,
	projection: JSObject
) => {

	const reporter = Reporter(
		context, collection,
		query, sort, projection
	);

	const algos = createAlgos(reporter);

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

	reporter.report({
		type: "file",
		format: "json",
		path: __dirname + "/../../reports" + `/report-${Date.now()}.json`
	});
}
