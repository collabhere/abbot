import { STORE_LOCATION } from "../utils/constants";

export const analyseUsableIndexes = async (
    collection: string, 
    query: {}, 
    sort: {}, 
    projection: {}
) => {

    const indexes = await import(`${STORE_LOCATION}/${collection}.json`);

    const indexDetailsArr = indexes[collection].map((index: {key: {}, name: string}) => {
        const indexDetailsObj = new Object();
        indexDetailsObj['name'] = index.name;
        if (Object.keys(query).includes(Object.keys(index.key)[0])) {
            const queryFieldTypes = getQueryFieldTypes (query, sort); 
            indexDetailsObj['coverage'] = getCoverage(index.key, queryFieldTypes);
            indexDetailsObj['isEsrSupported'] = checkESR(index.key, queryFieldTypes);
        } else {
            indexDetailsObj['coverage'] = null;
            indexDetailsObj['isEsrSupported'] = false;
        }
        return indexDetailsObj;
    });

    let bestIndexes = getIndexesWithMaxCoverage(indexDetailsArr);

    bestIndexes.forEach((index: {name: string, isEsrSupported: boolean, coverage: any}) => {

        if (index.coverage.uncoveredFields && index.coverage.uncoveredFields.length > 0) {
            console.log(index.name);
            console.log(`Add the following fields to your query to use this index better:  ${index.coverage.uncoveredFields}`);
        }
        if (!index.isEsrSupported) {
            console.log('This index does not follow ESR rule for this query!')
        }
        console.log('\n');
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
): {coveredCount: number, totalCount: number, uncoveredFields: string[]} => {

    let coveredCount: number = 0, totalCount: number = 0, 
        uncoveredStreak: boolean = true, unconfirmedIndex: number = -1,
        uncoveredCount:number = 0;
    const uncoveredFields: string[] = [];

    for (let indexKey in indexKeys) {
        totalCount += 1;
        if (queryFieldTypes.equality.includes(indexKey)
                || queryFieldTypes.range.includes(indexKey)
                || queryFieldTypes.sort.includes(indexKey)) {

            coveredCount += 1;
            uncoveredStreak = false; 
            unconfirmedIndex = -1;       
        } else {
            uncoveredCount += 1;
            if (!uncoveredStreak) {
                unconfirmedIndex = uncoveredCount - 1;
            }
            uncoveredFields.push(indexKey);

            uncoveredStreak = true;
        }
    }

    if (unconfirmedIndex !== -1) uncoveredFields.splice(unconfirmedIndex, uncoveredFields.length - unconfirmedIndex);

    return {coveredCount, totalCount, uncoveredFields};
}

const getIndexesWithMaxCoverage = (indexArr: {name: string, isEsrSupported: boolean, coverage: any}[]) => {

    let maxCoverageCount = 0;
    indexArr.forEach((index) => {
        if (index.coverage && index.coverage.coveredCount > maxCoverageCount) {
            maxCoverageCount = index.coverage.coveredCount;
        }
    });

    return indexArr.filter(index => index.coverage && index.coverage.coveredCount === maxCoverageCount);
}