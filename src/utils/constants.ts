export const STORE_LOCATION = __dirname + "/../../store";

export const SUGGESTION_TYPES = {
	ADD_FIELD: "add_field",
	CHANGE_OPERATION: "change_operation",
	CHANGE_INDEX: "change_index",
	ADD_FIELD_FOR_COVERED_QUERY: "add_field_for_covered_query",
	CREATE_INDEX: "create_new_index",
	REMOVE_ID_PROJECTION: "remove_id_from_projection",
	CHANGE_PROJECTION: "remove_fields_from_projection",
	SORT_GROUP_FIRST: "sort_before_group_and_first",
	SORT_BEFORE_INTERVENE: "sort_before_intervening_stages",
	MATCH_BEFORE_EVERYTHING: "match_before_everything"
};