import { IQueryFieldTypes, JSObject } from "../../utils/types";

export const getStreak = (
	indexKeys: JSObject,
	queryFieldTypes: IQueryFieldTypes
): number => {
	let currentStreak = 0;
	for (let indexKey in indexKeys) {
		if (queryFieldTypes.equality.includes(indexKey)
			|| queryFieldTypes.range.includes(indexKey)
			|| queryFieldTypes.sort.includes(indexKey)) {

			currentStreak += 1;
		} else {
			return currentStreak;
		}
	}
}