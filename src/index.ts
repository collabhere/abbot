import { Prepare } from "./lib/prepare";
import { Abbot } from "./lib/abbot";
import { ContextType } from "./utils/types"

const context: ContextType = {
	mongooseInstance: undefined
};

const prepare = Prepare(context);

const abbot = Abbot(context);

export = { abbot, prepare };
