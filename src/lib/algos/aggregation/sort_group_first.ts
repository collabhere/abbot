import { Reporter } from "../../../lib/reporter";
import { SUGGESTION_TYPES } from "../../../utils/constants";
import { checkQueryForIndexedField } from "../../../utils/query";

import { isObj } from "../../../utils";

const FIRST_RGX = new RegExp(/\$first/g);

export const sortBeforeGroupFirst = (reporter: Reporter) => (
	[indexedList, unindexedList]: { [k: string]: any }[][]
) => {

	// let needToReport = true;
	// let firstField: string;

	// const sortKeys =
	// 	unindexedList
	// 		.filter(val => val.$sort)
	// 		.map(stage => Object.keys(stage.$sort))
	// 		.flat(1);

	// const groups = unindexedList.map((val, i) => {
	// 	if (val.$group) {
	// 		return { $group: val.$group, pos: i }
	// 	}
	// }).filter(Boolean);

	// if (sortKeys.length && groups.length) {
	// 	groups.forEach(group => {
	// 		if (FIRST_RGX.test(JSON.stringify(group.$group))) {
	// 			const groupedBy = group.$group._id;
	// 			if (isObj(groupedBy)) {
	// 				if (
	// 					checkQueryForIndexedField(groupedBy, indexKeys) // Grouped by a key in the index
	// 					&& sortKeys.some(key => groupedBy === key) // Grouped by a key that is a part of some sort
	// 				) {
						
	// 				}
	// 			} else if (typeof groupedBy === "string") {
	// 				const field = groupedBy.replace(/^\$/g, '');
	// 				const keys = Object.keys(indexKeys);
	// 				const matchingSort = sortKeys.find(key => field === key);
	// 				if (
	// 					keys.includes(field) // Grouped by a key in the index
	// 					&& (matchingSort && matchingSort.length === 1) // Grouped by a key that is a part of some sort
	// 				) {
	// 					const pipeline = indexedList.concat(unindexedList);
	// 				}
	// 			}
	// 		}
	// 	});
	// }

	// if (needToReport) reporter.suggest(indexName, SUGGESTION_TYPES.SORT_BEFORE_GROUP_FIRST, [firstField]);
}
