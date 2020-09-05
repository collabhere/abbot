import { Reporter } from "../reporter";
import { IQueryFieldTypes } from "../../utils/types";
import { SUGGESTION_TYPES } from "../../utils/constants";

export const newIndexSuggestion = (reporter: Reporter) => (
    queryFieldTypes: IQueryFieldTypes
) => {
    const queryFields = queryFieldTypes.equality.concat(queryFieldTypes.sort, queryFieldTypes.range);

    const indexKeys = queryFields.reduce((acc, field) => Object.assign(acc, {[field]: 1}), {});

    reporter.suggestNewIndex(SUGGESTION_TYPES.CREATE_INDEX, indexKeys);
}