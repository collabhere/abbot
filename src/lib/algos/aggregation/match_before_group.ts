import { Reporter } from "../../reporter";
import { SUGGESTION_TYPES } from "../../../utils/constants";
import { MongoIndexKey } from "../../../utils/types";

export const matchBeforeGroup = (reporter: Reporter) => (
	indexName: string,
	indexKeys: MongoIndexKey,
	[indexedList, unindexedList]: { [k: string]: any }[][]
) => {

	let group: any = undefined;
	unindexedList.forEach((stage) => {
		if (stage.$group) {
			group = stage.$group;
			//acc.push(...Object.keys(stage.$group));
		} else if (stage.$match && Object.keys(stage.$match).includes(Object.keys(indexKeys)[0]) && group) {
			Object.keys(stage.$match).forEach(q => {
				const acc = Object.keys(group);
				if (!acc.includes(q) && acc.length > 0) {
					reporter.suggest(indexName, SUGGESTION_TYPES.MATCH_BEFORE_GROUP, [JSON.stringify(stage.$match), JSON.stringify(group)])
				}
			});
		}
	});
}