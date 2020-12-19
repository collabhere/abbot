
import { convertQueryExpressions } from "../utils/conditions";
import { coalescenceConverter } from "../utils/aggregation";

import { analyseQuery, Analyse$Query } from "./analyse/query";
import { analyseAggregation, Analyse$Aggregation } from "./analyse/aggregation";

const middleware = (func: any, type: any) => (...args: any) => {
	if (type === 'query') {
		args[0].conditions = convertQueryExpressions(args[0].query);
	} else {
		args[0].condiions = coalescenceConverter(args[0].pipeline);
	}

	return func(...args);
}

export interface Analyse {
	query: (opts: Analyse$Query) => void;
	aggregation: (opts: Analyse$Aggregation) => void;
}

export default () => ({
	query: middleware(analyseQuery(), 'query'),
	aggregation: middleware(analyseAggregation(), 'aggregation')
}) as Analyse;
