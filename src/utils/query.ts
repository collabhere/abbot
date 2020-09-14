import { IQueryFieldTypes } from "./types";

export const isEquality = (queryFieldVal: any | string | number): boolean => {
	if (typeof queryFieldVal === 'string'
		|| typeof queryFieldVal === 'number'
		|| (typeof queryFieldVal === 'object'
			&& (Object.keys(queryFieldVal)[0] === '$eq'
				|| Object.keys(queryFieldVal)[0] === '$size'))) {

		return true;
		
	} else if (Object.keys(queryFieldVal)[0] === '$expr') {
		//@todo: Call getPossibleExpressions() 
		//@todo: Other checks for '$expr'
	}

	return false;
}

export const getQueryFieldTypes = (
	query: any,
	sortFields: any
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

