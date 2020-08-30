import { IQueryFieldTypes } from "../../utils/types";
import { Reporter } from "../reporter";
import { SUGGESTION_TYPES } from "../../utils/constants";

type HopItem = {
	key: string;
	position: number;
};

type PositionDetail = {
	rightMostEqualityPosition: number;
	rightMostRangePosition: number;
	rangeHops: HopItem[];
	sortHops: HopItem[];
}

/**
 * Identify details of each key in the index used for further positional analysis
 * i.e.
 * 	1. Right most equality and range.
 * 	2. All range and sort key hop counts from left of index.
 * @param param0 Query fields segregated by their type, i.e. equalities, sorts and ranges
 * @param keys Index keys
 */
export const getPositionDetails = (
	{ equality: equalities, sort: sorts, range: ranges }: IQueryFieldTypes,
	keys: string[]
) => keys.reduce(
	(acc, key, pos) => {
		if (equalities.includes(key)) {
			if (pos > acc.rightMostEqualityPosition) acc.rightMostEqualityPosition = pos;
		} else if (sorts.includes(key)) {
			acc.sortHops.push({ key, position: pos });
		} else if (ranges.includes(key)) {
			if (pos > acc.rightMostRangePosition) acc.rightMostRangePosition = pos;
			acc.rangeHops.push({ key, position: pos });
		}
		return acc;
	},
	{
		rightMostEqualityPosition: -1, rightMostRangePosition: -1,
		rangeHops: [], sortHops: []
	});

export const positionAnalysis = (reporter: Reporter) => (
	indexName: string,
	indexKeys: any,
	queryFieldTypes: IQueryFieldTypes
) => {

	const details: PositionDetail = getPositionDetails(queryFieldTypes, Object.keys(indexKeys));

	/**
	 * Find ranges that are present before equalities
	 */
	const incorrectRangeKeys =
		details
			.rangeHops
			.filter(({ position }) => (position < details.rightMostEqualityPosition))
			.map(k => k.key);

	/**
	 * Find sorts that are present in the wrong position, i.e. before equality or after ranges.
	 */
	const incorrectSortKeys =
		details
			.sortHops
			.filter(({ position }) => (position < details.rightMostEqualityPosition) || (position > details.rightMostRangePosition))
			.map(k => k.key);

	if (incorrectRangeKeys && incorrectRangeKeys.length) {
		reporter.suggest(indexName, SUGGESTION_TYPES.CHANGE_OPERATION, incorrectRangeKeys);
	}

	if (incorrectSortKeys && incorrectSortKeys.length) {
		reporter.suggest(indexName, SUGGESTION_TYPES.CHANGE_INDEX, incorrectSortKeys);
	}
}
