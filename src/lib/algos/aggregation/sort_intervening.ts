import { Reporter } from "../../../lib/reporter";
import { SUGGESTION_TYPES } from "../../../utils/constants";
import { checkQueryForIndexedField } from "../../../utils/query";


export const sortBeforeInterveningStages = (reporter: Reporter) => (
    indexName: string,
    indexKeys: {[k:string]: 1|-1},
    [indexedList, unindexedList]: {[k: string]: any}[][]
) => {
    let isInterveningStage = false;
    unindexedList.forEach((stage) => {
        if (stage.$sort 
            && checkQueryForIndexedField(stage.$sort, indexKeys) 
            && isInterveningStage) {
                reporter.suggest(indexName, SUGGESTION_TYPES.SORT_BEFORE_INTERVENE, Object.keys(stage.$sort));
        } else if(stage.$group || stage.$unwind || stage.$project) {
            isInterveningStage = true;
        } 
    });
}
