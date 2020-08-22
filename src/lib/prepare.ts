import { validateContext } from "../utils/query";
import { getIndexes } from "./get-indexes";
import { Abbot } from "./abbot";
import { ContextType, PrepareOptions } from '../utils/types';

export const Prepare = (context:ContextType)  => (
	opts: PrepareOptions
) => {
	Object.assign(context, opts);

	validateContext(context);
	
	getIndexes(opts.mongooseInstance, opts.collections); // Make this conditional in the future

	return Abbot(context);
}
