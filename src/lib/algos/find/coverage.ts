import { IQueryFieldTypes } from "../../../utils/types";
import { SUGGESTION_TYPES } from "../../../utils/constants";
import { Reporter } from "../../reporter";

export const coverageForIndex = (reporter: Reporter) => (
	indexName: string,
	indexKeys: any,
	queryFieldTypes: IQueryFieldTypes,
	projection: any
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

	} else if (Object.keys(projection).length > 0) {

		const indexFields = Object.keys(indexKeys);
		const uncoveredProjectedFields = Object.keys(projection).filter((key) => !indexFields.includes(key));

		if (uncoveredProjectedFields && uncoveredProjectedFields.length > 0) {

			if (uncoveredProjectedFields.length !== 1 || uncoveredProjectedFields[0] !== '_id')
				//suggest removing uncovered fields from projection
				reporter.suggest(indexName, SUGGESTION_TYPES.CHANGE_PROJECTION, uncoveredProjectedFields);

		} else if (uncoveredProjectedFields && uncoveredProjectedFields.length === 0) {
			//suggest adding _id:0 to projection
			reporter.suggest(indexName, SUGGESTION_TYPES.REMOVE_ID_PROJECTION);
		}
	}
}
