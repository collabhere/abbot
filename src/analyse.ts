
import { convertQueryExpressions } from "./utils/conditions";
import { coalescenceConverter } from "./utils/aggregation";

import { analyseQuery, Analyse$Query } from "./lib/analyse/query";
import { analyseAggregation, Analyse$Aggregation } from "./lib/analyse/aggregation";

const middleware = (func: any, type: any) => (...args: any) => {
	if (type === 'query') {
		args[0].conditions = convertQueryExpressions(args[0].query);
	} else {
		args[0].pipeline = coalescenceConverter(args[0].pipeline);
	}

	return func(...args);
}

export interface Analyse {
	query: (opts: Analyse$Query) => void;
	aggregation: (opts: Analyse$Aggregation) => void;
}

export const Analyse: Analyse = ({
	query: middleware(analyseQuery(), 'query'),
	aggregation: middleware(analyseAggregation(), 'aggregation')
});
