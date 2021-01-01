import { Reporter } from "../reporter";
import { IQueryFieldTypes } from "../../utils/types";
import { SUGGESTION_TYPES } from "../../utils/constants";

export const newIndexSuggestion = (reporter: Reporter) => (
	queryFieldTypes: IQueryFieldTypes
) => {
	const queryFields = [...queryFieldTypes.equality, ...queryFieldTypes.sort, ...queryFieldTypes.range];

	const indexKeys = queryFields.reduce((acc, field) => (acc += acc ? ('_' + field + '_1') : (field + '_1'), acc), '');

	reporter.suggest(indexKeys, SUGGESTION_TYPES.CREATE_ESR_INDEX);
}