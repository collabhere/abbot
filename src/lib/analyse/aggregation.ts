import {
	STORE_LOCATION
} from "../../utils/constants";

import { StoredCollection, StoredIndex } from "../../utils/types";
import { splitPipeline } from "../../utils/aggregation";

import { Reporter } from "../reporter";
import { createAlgos, Algorithms } from "../algos";

const runAggregationAnalysisForIndex = (
	algos: Algorithms,
	split: [any[], any[]]
) => ({ name, key }: StoredIndex) => {
	algos.aggregation.matchBeforeGroup(name, key, split);
	algos.aggregation.sortBeforeGroup(name, key, split);
	algos.aggregation.sortBeforeInterveningStages(name, key, split);
}
export interface Analyse$Aggregation {
	collection: string,
	pipeline: any
}

export const analyseAggregation = () => ({
	collection,
	pipeline
}: Analyse$Aggregation) => {

	const reporter = Reporter(
		collection, pipeline
	);

	const algos = createAlgos(reporter);

	const indexes: StoredCollection = require(`${STORE_LOCATION}/${collection}.json`);

	/* Fitler indexes that will actually be used by mongo to support this query, i.e. indexes which have the first key in the query */
	const testableIndexes = indexes[collection].filter(index => (Object.keys(index.key) && Object.keys(index.key)[0]));

	if (testableIndexes && testableIndexes.length) {
		const split = splitPipeline(pipeline);
		// Run analysis for each index and derive suggestions using report builder module.
		testableIndexes.forEach(
			runAggregationAnalysisForIndex(algos, split)
		)
	} else {
		// No indexes found to support this query.
		// Proceed to determining the most optimal index for this query by ESR.
	}
}