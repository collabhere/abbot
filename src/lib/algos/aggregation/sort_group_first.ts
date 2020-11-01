import { Reporter } from "../../../lib/reporter";
import { SUGGESTION_TYPES } from "../../../utils/constants";
import { checkQueryForIndexedField } from "../../../utils/query";

export const sortBeforeGroupFirst = (reporter: Reporter) => (
    indexName: string,
    indexKeys: {[k:string]: 1|-1},
    [indexedList, unindexedList]: {[k: string]: any}[][]
) => {

    let needToReport = true;
    let firstField: string;
    unindexedList.reduce((acc: any[], val: {[k: string]: any}) => {
        if (val.$group && new RegExp(/\$first/g).test(JSON.stringify(val.$group))) {
            Object.keys(val.$group).forEach((key) => {

                if (val.$group[key]['$first']) 
                    firstField = val.$group[key]['$first'].substring(1);

                if (firstField)
                    needToReport = false;
            });

        } else if (val.$sort && checkQueryForIndexedField(val.$sort, indexKeys)) {
            acc.push(...Object.keys(val.$sort));
        }

        return acc;

    }, []) as string[];

    if (needToReport) reporter.suggest(indexName, SUGGESTION_TYPES.SORT_GROUP_FIRST, [firstField]);
}
