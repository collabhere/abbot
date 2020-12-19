import {
	STORE_LOCATION
} from "../../utils/constants";

import { StoredCollection } from "../../utils/types";
import { splitPipeline } from "../../utils/aggregation";

import { Reporter } from "../reporter";
import { createAlgos } from "../algos";

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

	const split = splitPipeline(pipeline);

	algos.aggregation.sortBeforeInterveningStages(split);

	algos.aggregation.matchAsFirstStage(split);

	const indexes: StoredCollection = require(`${STORE_LOCATION}/${collection}.json`);

	const collectionIndexes = indexes[collection];

	collectionIndexes.forEach(({ key, name }) => {
		algos.aggregation.matchBeforeGroup(name, key, split);
	});
	
	reporter.report({});
}