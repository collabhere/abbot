import { IQueryFieldTypes, CoverageType, JSObject, IndexDetailsType } from "../../utils/types";

export const getIndexesWithMaxCoverage = (indexArr: Array<IndexDetailsType>) => {

	let maxCoverageCount = 0;
	indexArr.forEach((index) => {
		if (index.coverage && index.coverage.coveredCount > maxCoverageCount) {
			maxCoverageCount = index.coverage.coveredCount;
		}
	});

	return indexArr.filter(index => (index.coverage && index.coverage.coveredCount === maxCoverageCount)
		|| index.fieldStreak && index.fieldStreak >= 2);
}

export const getCoverage = (
	indexKeys: JSObject,
	queryFieldTypes: IQueryFieldTypes
): CoverageType => {

	let coveredCount: number = 0, totalCount: number = 0,
		uncoveredStreak: boolean = true, unconfirmedIndex: number = -1,
		uncoveredCount: number = 0;
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

	return { coveredCount, totalCount, uncoveredFields };
}