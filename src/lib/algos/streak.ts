import { IQueryFieldTypes } from "../../utils/types";

export const getStreak = (
	indexKeys: any,
	queryFieldTypes: IQueryFieldTypes
) => {
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