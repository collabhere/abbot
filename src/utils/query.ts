import { IQueryFieldTypes } from "./types";

export const isEquality = (queryFieldVal: any | string | number): boolean =>  
										(typeof queryFieldVal === 'string'
										|| typeof queryFieldVal === 'number'
										|| (typeof queryFieldVal === 'object'
											&& (Object.keys(queryFieldVal)[0] === '$eq'
											|| Object.keys(queryFieldVal)[0] === '$size'))) ? true: false;


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

export const checkQueryForIndexedField = (query: {[k: string]: any}, indexKeys: {[k:string]: 1|-1}) => {
    const sortKeys = Object.keys(query);
    for (const key in indexKeys) {
        if (sortKeys.includes(key)) return true;
    }

    return false;
}

