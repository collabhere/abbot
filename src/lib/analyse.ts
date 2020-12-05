import {
	STORE_LOCATION
} from "../utils/constants";

import { getQueryFieldTypes } from "../utils/query";
import { StoredCollection, StoredIndex } from "../utils/types";
import { convertQueryExpressions } from "../utils/conditions";
import { coalescenceConverter } from "../utils/aggregation";

import { Reporter } from "./reporter";
import { createAlgos, Algorithms } from "./algos";

const runAggregationAnalysisForIndex = (
	algos: Algorithms,
	split: [any[], any[]]
) => ({ name, key }: StoredIndex) => {
	algos.aggregation.matchBeforeGroup(name, key, split);
}

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
	conditions?: any
};

const analyseQuery = () => ({
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
}

const INDEX_BREAKING_STAGES = ["$unwind"];

const splitPipeline = function (pipeline: any[]): [any[], any[]] {
	const indexSafeStages = [];
	let breakpoint = -1;
	const indexUnsafeStages = [];
	for (let i = 0; i < pipeline.length; ++i) {
		for (let breaker of INDEX_BREAKING_STAGES) {
			if (pipeline[i][breaker]) {
				breakpoint = i;
				break;
			}
			indexSafeStages.push(pipeline[i]);
		}
		/* not sure if break above will break out of both loops */
		if (breakpoint >= 0) break;
	}
	if (breakpoint >= 0) {
		indexUnsafeStages.push(...pipeline.slice(breakpoint));
	}
	return [indexSafeStages, indexUnsafeStages];
}

export interface Analyse$Aggregation {
	collection: string,
	pipeline: any
}

const analyseAggregation = () => ({
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


const middleware = (func: any, type: any) => (...args: any) => {
	if (type === 'query') {
		args[0].conditions = convertQueryExpressions(args.query);
	} else {
		args[0].condiions = coalescenceConverter(args.pipeline);
	}

	return func(...args);
}

/**
 * 
 * @param collection 
 * @param query 
 * @param sort 
 * @param projection 
 */
export const Analyse = () => {
	return {
		query: middleware(analyseQuery(), 'query'),
		aggregation: middleware(analyseAggregation(), 'aggregation')
	};
}


