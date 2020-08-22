import { validateContext } from "../utils/query";
import { getIndexes } from "./get-indexes";
import { Abbot } from "./abbot";
import { Mongoose } from "mongoose";

interface PrepareOptions {
	mongooseInstance: Mongoose,
	collections: string[]
}

export const Prepare = context => (
	opts: PrepareOptions
) => {
	Object.assign(context, opts);

	validateContext(context);
	
	getIndexes(opts.mongooseInstance, opts.collections); // Make this conditional in the future

	return Abbot(context);
}
