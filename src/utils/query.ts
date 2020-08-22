import { JSObject, IQueryFieldTypes, PositionDetailsType, ContextType } from "./types";

export const validateContext = function (
	context: ContextType
) {
	if (!context.mongooseInstance) {
		throw new Error("[abbot] No mongoose instance provided to abbot. Provide a mongoose instance to .prepare()");
	}
}

export const isEquality = (queryFieldVal: JSObject | string | number): boolean =>
	(typeof queryFieldVal === 'string'
		|| typeof queryFieldVal === 'number'
		|| (typeof queryFieldVal === 'object'
			&& Object.keys(queryFieldVal)[0] === '$eq')) ? true : false;

export const getQueryFieldTypes = (
	query: JSObject,
	sortFields: JSObject
): IQueryFieldTypes => {

	const equality = [], sort = [], range = [];

	for (let queryParam in query) {
		if (isEquality(query[queryParam])) {
			equality.push(queryParam);
		} else {
			range.push(queryParam);
		}
	}

	for (let sortParam in sortFields) {
		sort.push(sortParam);
	}

	return { equality, sort, range };
}

export const getPositionDetails = (
	indexKeys: JSObject,
	queryFieldTypes: IQueryFieldTypes
): PositionDetailsType => {

	let equalityMax = -1, currentHop = 0;
	const rangeHops: number[] = [];

	for (let indexKey in indexKeys) {
		if (queryFieldTypes.equality.includes(indexKey)) {
			if (currentHop > equalityMax) equalityMax = currentHop;
		} else if (queryFieldTypes.sort.includes(indexKey)) {
			// ??
		} else if (queryFieldTypes.range.includes(indexKey)) {
			rangeHops.push(currentHop);
		}
		currentHop += 1;
	}

	return { rangeHops, equalityMax };
}
