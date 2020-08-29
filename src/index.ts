import { Prepare } from "./lib/prepare";
import { Abbot } from "./lib/abbot";
import { Context } from "./utils/types"

const context: Context = {
	mongoUri: undefined,
	report: {},
	debugInfo: false
};

const prepare = Prepare(context);

const abbot = Abbot(context);

export = { abbot, prepare };
