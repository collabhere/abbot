import { yellow, blue } from "colors";

import { SUGGESTION_TYPES } from "../../utils/constants";

type ReporterState = { txt?: string | undefined };

interface Suggestion { suggestion: string; fields?: string[]; indexName: string }

const truncate = (str: string, len: number) => str.length > len ? str.substring(0, len) + "..." : str;

const esrRuleLink = () => `(Read more about it here: ${blue("https://www.mongodb.com/blog/post/performance-best-practices-indexing")})`;

function handleSuggestion(suggestion: Suggestion) {
	switch(suggestion.suggestion) {
		case SUGGESTION_TYPES.ADD_FIELDS_TO_INDEX: {
			return `\nAdd the field(s) ${yellow(suggestion.fields.join(", "))} to the index ${yellow(suggestion.indexName)} with any sorting order to utilize this index better.\n`;
		}
		case SUGGESTION_TYPES.ADD_FIELD_FOR_COVERED_QUERY: {
			return `\nAdd the field(s) ${yellow(suggestion.fields.join(", "))} to the index ${yellow(suggestion.indexName)} with any sorting order to utilize this index better.\n`;
		}
		case SUGGESTION_TYPES.CHANGE_SORT_KEYS_TO_FOLLOW_ESR: {
			return `\nFor the index ${yellow(suggestion.indexName)}, some sort fields (${yellow(suggestion.fields.join(", "))}) do not follow the ESR rule. ${esrRuleLink()}\n`;
		}
		case SUGGESTION_TYPES.CREATE_ESR_INDEX: {
			return `\nNo existing index can support your query. According to the ESR rule ${esrRuleLink()}, here's an index that could help.\n ${suggestion.indexName}\n`;
		}
		case SUGGESTION_TYPES.REMOVE_ID_PROJECTION_FROM_PROJECTION: {
			return `\nFor better support with index (${yellow(suggestion.indexName)}) add \`"_id": 0\` to your projection ${yellow(suggestion.fields[0])}\n`;
		}
		case SUGGESTION_TYPES.REMOVE_FIELDS_FROM_PROJECTION: {
			return `\nFor better support with index (${yellow(suggestion.indexName)}) remove these fields (${yellow(suggestion.fields.join(", "))}) from your projection\n`;
		}
		case SUGGESTION_TYPES.SORT_BEFORE_INTERVENE: {
			const [sortStage, interveningStage] = suggestion.fields;
			return `\nFor the index: ${yellow(suggestion.indexName)}.\nMove the $sort stage ${yellow(sortStage)} before the index usage intervening stage ${yellow(interveningStage)}.\n`
		}
		case SUGGESTION_TYPES.MATCH_BEFORE_GROUP: {
			const [match, group] = suggestion.fields;
			return `\nConsider moving this match stage (${yellow(match)} before the group stage (${yellow(group)}) for better support with index (${yellow(suggestion.indexName)})\n`
		}
		case SUGGESTION_TYPES.ADD_MATCH_FIRST_STAGE: {
			const [indexedStagesStr] = suggestion.fields;
			try {
				const indexedStages = JSON.parse(indexedStagesStr);
				if (indexedStages) {
					if (indexedStages instanceof Array && indexedStages.length > 0) {
						return `\nReduce documents by adding a $match stage at the start of this pipeline - ${yellow(truncate(indexedStagesStr, 50))}\n`;
					}
				}
				return `\nReduce documents by adding a $match stage that will utilize any index as the first stage of your pipeline.\n`;
			} catch { /* silently fail for now. @todo */ }
		}
		case SUGGESTION_TYPES.MOVE_MATCH_FIRST_STAGE: {
			const [match, interveningStage] = suggestion.fields;
			return `\nMove the $match stage (${yellow(match)}) before the index usage intervening stage (${yellow(interveningStage)})`;
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
				console.log("** ABBOT TEXT REPORTER **");
				console.log(state.txt);
			} else {
				console.log("Nothing to report!");
			}
		}
	}
}