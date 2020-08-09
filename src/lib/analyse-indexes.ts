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
        indexDetailsObj['keys'] = index.key;
        if (Object.keys(query).includes(Object.keys(index.key)[0])) {
            const queryFieldTypes = getQueryFieldTypes (query, sort); 
            indexDetailsObj['coverage'] = getCoverage(index.key, queryFieldTypes);
            indexDetailsObj['keyWiseDetails'] = getPositionDetails(index.key, queryFieldTypes);
            indexDetailsObj['fieldStreak'] = getStreak(index.key, queryFieldTypes);
        } else {
            indexDetailsObj['coverage'] = null;
            indexDetailsObj['keyWiseDetails'] = null;
            indexDetailsObj['fieldStreak'] = null;
        }
        return indexDetailsObj;
    });

    let bestIndexes = getIndexesWithMaxCoverage(indexDetailsArr);

    bestIndexes.forEach(
        (index: {
            name: string, 
            keys: {},
            coverage: any, 
            fieldStreak: number, 
            keyWiseDetails: {rangeHops: number[], equalityMax: number}
        }) => {

            const rangeFieldHops = index.keyWiseDetails.rangeHops.filter(key => key < index.keyWiseDetails.equalityMax);

            let hop: number = 0, rangeFields: string[] = [];
            for (let key in index.keys) {
                if (rangeFieldHops.includes(hop)) {
                    rangeFields.push(key);
                }
                hop += 1;
            } 

            console.log(index.name);
            if (index.coverage.uncoveredFields && index.coverage.uncoveredFields.length > 0) 
                console.log(`Add the following fields to your query to use this index better:  ${index.coverage.uncoveredFields}`);

            if (rangeFields && rangeFields.length > 0)
                console.log(`The following range fields can be changed to equality fields: ${rangeFields}`);


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


const getPositionDetails = (
    indexKeys: {}, 
    queryFieldTypes: {equality: string[], sort: string[], range: string[]}
) : {rangeHops: number[], equalityMax: number} => {

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

    return {rangeHops, equalityMax};
}


const getStreak = (
    indexKeys: {},
    queryFieldTypes: {equality: string[], sort: string[], range: string[]}
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


const getIndexesWithMaxCoverage = (indexArr: {name: string, coverage: any, fieldStreak: number}[]) => {

    let maxCoverageCount = 0;
    indexArr.forEach((index) => {
        if (index.coverage && index.coverage.coveredCount > maxCoverageCount) {
            maxCoverageCount = index.coverage.coveredCount;
        }
    });

    return indexArr.filter(index => (index.coverage && index.coverage.coveredCount === maxCoverageCount) 
                                        || index.fieldStreak && index.fieldStreak >= 2);
}