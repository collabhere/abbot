import { SUGGESTION_TYPES } from "../../utils/constants";

type ReporterState = { txt?: string | undefined };

interface Suggestion { suggestion: string; fields?: string[]; indexName: string }

const truncate = (str: string, len: number) => str.length > len ? str.substring(0, len) + "..." : str;

function handleSuggestion(suggestion: Suggestion) {
	switch(suggestion.suggestion) {
		case SUGGESTION_TYPES.ADD_FIELDS_TO_INDEX: {
			return `\nAdd the field(s) { ${suggestion.fields.join(", ")} } to the index { ${suggestion.indexName} } with any sorting order to utilize this index better.\n`;
		}
		case SUGGESTION_TYPES.ADD_FIELD_FOR_COVERED_QUERY: {
			return `\nAdd the field(s) { ${suggestion.fields.join(", ")} } to the index { ${suggestion.indexName} } with any sorting order to utilize this index better.\n`;
		}
		case SUGGESTION_TYPES.SORT_BEFORE_INTERVENE: {
			const [sortStage, interveningStage] = suggestion.fields;
			return `\nMove the $sort stage { ${sortStage} } before the index usage intervening stage { ${interveningStage} }.\n`
		}
		default: { return ''; }
	}
}

interface ReporterType {
	collection: string;
	type: "query" | "aggregation";
	suggestions: Suggestion[],
	query: string;
}

export = function() {
	return {
		onQuery: (state: ReporterState, info: ReporterType, first: boolean) => {
			if (first) { // First call
				state.txt =`\n\nQuery: ${truncate(info.query, 200)} \n\nConsider the following suggestions to improve this query's performance.\n`;
				
				info.suggestions.forEach(s => {
					state.txt += handleSuggestion(s);
				});
			} else { // Subsequent calls
				info.suggestions.forEach(s => {
					state.txt += handleSuggestion(s);
				});
			}
		},
		onComplete: (state: ReporterState) => {
			if (state.txt) {
				console.log(state.txt);
			} else {
				console.log("Nothing to report!");
			}
		}
	}
}