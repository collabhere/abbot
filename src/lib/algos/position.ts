import { PositionDetailsType, JSObject, IQueryFieldTypes } from "../../utils/types";

export const getPositionDetails = (
	indexKeys: JSObject,
	queryFieldTypes: IQueryFieldTypes
): PositionDetailsType => {

	let equalityMax: number = -1, currentHop: number = 0, rangeMax: number = -1;
	const rangeHops: number[] = [], sortHops: number[] = [];

	for (let indexKey in indexKeys) {
		if (queryFieldTypes.equality.includes(indexKey)) {
			if (currentHop > equalityMax) equalityMax = currentHop;
		} else if (queryFieldTypes.sort.includes(indexKey)) {
			sortHops.push(currentHop);
		} else if (queryFieldTypes.range.includes(indexKey)) {
            if (currentHop > rangeMax) rangeMax = currentHop;
			rangeHops.push(currentHop);
		}
		currentHop += 1;
	}

	return { rangeHops, equalityMax, sortHops, rangeMax };
}