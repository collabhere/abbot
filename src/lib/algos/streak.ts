import { IQueryFieldTypes, JSObject } from "../../utils/types";
import { Reporter } from "../reporter";
import { SUGGESTION_TYPES } from "../../utils/constants";

export const checkStreak = (reporter: Reporter) => (
	indexName: string,
	indexKeys: JSObject,
	queryFieldTypes: IQueryFieldTypes
) => {
	const isUsed = (key: string) =>
		queryFieldTypes.equality.includes(key)
		|| queryFieldTypes.range.includes(key)
		|| queryFieldTypes.sort.includes(key);

	const keys = Object.keys(indexKeys);

	const streak =
		keys
			.reduce(
				(streak, key) => {
					if (isUsed(key)) ++streak;
					return streak;
				}
				, 0);

	if (
		streak > 1 // Streak is made
		&& (Math.floor((streak / keys.length) * 100) >= 75) // AND we have >= 75% fields of an index
	) {
		reporter.suggest(indexName, SUGGESTION_TYPES.ADD_FIELD_FOR_COVERED_QUERY, keys.slice(streak, keys.length));
	}
}