import { STORE_LOCATION } from "../utils/constants";

export const analyseUsableIndexes = async (
    collection: string, 
    query: {}, 
    sort: {}, 
    projection: {}
) => {

    const indexes = await import(`${STORE_LOCATION}/${collection}.json`);

    indexes[collection].forEach((index: {key: {}, name: string}) => {
        console.log(index.name + ':');
        if (Object.keys(query).includes(Object.keys(index.key)[0])) {
            const queryFieldTypes = getQueryFieldTypes (query, sort);
            const coverage = getCoverage(index.key, queryFieldTypes);
            console.log(`${coverage.coveredCount} out of ${coverage.totalCount} fields in the index cover this query`);
            if (!checkESR(index.key, queryFieldTypes)) console.log("Index does not follow ESR!");
        } else {
            console.log("There's no index supporting this query!")
        }
    });
}

const isEquality = (queryFieldVal: {} | string | number): boolean => 
(typeof queryFieldVal === 'string' 
    || typeof queryFieldVal === 'number'
    || (typeof queryFieldVal === 'object'
        && Object.keys(queryFieldVal)[0] === '$eq')) ?  true : false;


const getQueryFieldTypes = (
    query: {}, 
    sortFields: {}
): {equality: string[], sort: string[], range: string[]} => {

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

    return {equality, sort, range}
} 


const checkESR = (
    indexKeys: {}, 
    queryFieldTypes: {equality: string[], sort: string[], range: string[]}
) : boolean => {

    let sortFlag: boolean, rangeFlag: boolean; 

    for (let indexKey in indexKeys) {
        if (queryFieldTypes.equality.includes(indexKey)) {
            if (rangeFlag || sortFlag) return false;
        } else if (queryFieldTypes.sort.includes(indexKey)) {
            sortFlag = true;
            if (rangeFlag) return false;
        } else if (queryFieldTypes.range.includes(indexKey)) {
            rangeFlag = true;
        }
    }

    return true;
}

const getCoverage = (
    indexKeys: {}, 
    queryFieldTypes: {equality: string[], sort: string[], range: string[]}
): {coveredCount: number, totalCount: number} => {

    let coveredCount: number = 0, totalCount: number = 0;

    for (let indexKey in indexKeys) {
        totalCount += 1;
        if (queryFieldTypes.equality.includes(indexKey)
                || queryFieldTypes.range.includes(indexKey)
                || queryFieldTypes.sort.includes(indexKey)) coveredCount += 1;
    }

    return {coveredCount, totalCount};
}