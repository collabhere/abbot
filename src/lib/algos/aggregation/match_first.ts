import { Reporter } from "../../../lib/reporter";
import { SUGGESTION_TYPES } from "../../../utils/constants";

export const matchAsFirstStage = (reporter: Reporter) => (
	[indexedList, unindexedList]: { [k: string]: any }[][]
) => {
	const hasFirstAsMatch = indexedList && indexedList.length > 0 && indexedList[0].$match;
	
	if (!hasFirstAsMatch) {
		let hasMatchInPipeline = false;
		let matchIndex = -1;
		const pipeline = indexedList.concat(unindexedList);
		pipeline.forEach((stage, i) => {
			if (stage.$match && !hasMatchInPipeline) {
				hasMatchInPipeline = true;
				matchIndex = i;
			}
		});
		if (hasMatchInPipeline) {
			reporter.suggest(undefined, SUGGESTION_TYPES.MOVE_MATCH_FIRST_STAGE, [JSON.stringify(pipeline[matchIndex])]);
		} else {
			reporter.suggest(undefined, SUGGESTION_TYPES.ADD_MATCH_FIRST_STAGE, [JSON.stringify(indexedList)]);
		}
	}
}
