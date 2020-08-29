import { JSObject, IQueryFieldTypes, Context } from "./types";

export const validateContext = function (
	context: Context
) {
	if (!context.mongoUri) {
		throw new Error("[abbot] No MongoDB connection-string provided to abbot. Provide a MongoDB connection-string to .prepare()");
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

