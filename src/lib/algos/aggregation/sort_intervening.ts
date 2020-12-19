import { Reporter } from "../../../lib/reporter";
import { SUGGESTION_TYPES } from "../../../utils/constants";
import { checkQueryForIndexedField } from "../../../utils/query";
import { logger } from "../../logger";


export const sortBeforeInterveningStages = (reporter: Reporter) => (
	[indexedList, unindexedList]: { [k: string]: any }[][]
) => {
	unindexedList.forEach((stage) => {
		if (stage.$sort) {
			reporter.suggest(undefined, SUGGESTION_TYPES.SORT_BEFORE_INTERVENE, [JSON.stringify(stage), JSON.stringify(unindexedList[0])]);
		}
	});
}
