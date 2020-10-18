import { Reporter } from "../../../lib/reporter";
import { SUGGESTION_TYPES } from "../../../utils/constants";
import { MongoIndexKey } from "../../../utils/types";
    
export const matchBeforeGroup = (reporter: Reporter) => (
    indexName: string,
    indexKeys: MongoIndexKey,
    [indexedList, unindexedList]: {[k: string]: any}[][]
) => {

    let acc: any = []
    unindexedList.forEach((stage) => {
        if (stage.$group) {
            acc.push(...Object.keys(stage.$group));
        } else if (stage.$match && Object.keys(stage.$match).includes(Object.keys(indexKeys)[0])) {
            Object.keys(stage.$match).forEach(q => {
                if (!acc.includes(q) && acc.length > 0) {
                    reporter.suggest(indexName, SUGGESTION_TYPES.MATCH_BEFORE_EVERYTHING, stage.$match)
                } 
            });
        }
    });
}