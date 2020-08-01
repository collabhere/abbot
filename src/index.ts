import { validateContext } from "./lib/validate-context";
import { Abbot } from "./lib/abbot";

const context = {
	mongooseInstance: undefined
};

const abbot = Abbot(context);

const prepare = function ({
	mongooseInstance
}) {
	Object.assign(
		context,
		{
			mongooseInstance
		}
	);

	validateContext(context);

	return abbot;
}

export = { abbot, prepare };
