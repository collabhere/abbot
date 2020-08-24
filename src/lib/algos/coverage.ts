import { IQueryFieldTypes, JSObject } from "../../utils/types";
import { SUGGESTION_TYPES } from "../../utils/constants";
import { Reporter } from "../reporter";

export const coverageForIndex = (reporter: Reporter) => (
	indexName: string,
	indexKeys: JSObject,
	queryFieldTypes: IQueryFieldTypes
) => {

	const isUsed = (key: string) =>
		queryFieldTypes.equality.includes(key)
		|| queryFieldTypes.range.includes(key)
		|| queryFieldTypes.sort.includes(key);

	const unusedFields =
		Object
			.keys(indexKeys)
			.filter(
				(key, pos, keys) => (
					!isUsed(key)  // Current key is not used
					&& keys.some((k, p) => p > pos && isUsed(k)) // and there is some key ahead that is used.
				)
			);

	if (unusedFields && unusedFields.length) {
		reporter.suggest(indexName, SUGGESTION_TYPES.ADD_FIELD, unusedFields);
	}
}
