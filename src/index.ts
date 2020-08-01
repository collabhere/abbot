import { Prepare } from "./lib/prepare";
import { Abbot } from "./lib/abbot";

const context = {
	mongooseInstance: undefined
};

const prepare = Prepare(context);

const abbot = Abbot(context);

export = { abbot, prepare };
