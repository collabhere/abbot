
import { convertQueryExpressions } from "../utils/conditions";
import { coalescenceConverter } from "../utils/aggregation";

import { analyseQuery } from "./analyse/query";
import { analyseAggregation } from "./analyse/aggregation";

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


