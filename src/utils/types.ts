import { Mongoose } from "mongoose";

export interface IQueryFieldTypes {
	equality: string[];
	sort: string[];
	range: string[];
}

export type JSObject = { [k: string]: any }

export type MongoIndexKey = {
	[key: string]: 1 | -1;
}

export interface StoredIndex {
	key: MongoIndexKey;
	name: string;
}

export interface StoredCollection {
	[k: string]: StoredIndex[];
}

type SuggestionItem = { suggestion: string; fields: string[]; };

interface AnalysisReport {
	[k: string]: Array<SuggestionItem | { relation?: "AND" | "OR"; suggestions?: SuggestionItem[] }>
}

export interface Context {
	mongooseInstance: Mongoose;
	report: AnalysisReport;
	debugInfo: boolean; /* If true, abbot will print whats happening. Defaults to false. */
}

export interface AbbotOptions {
	collection: string;
	query: any;
	sort?: any;
	project?: any;
}

export interface PrepareOptions {
	mongooseInstance: Mongoose;
	collections: string[];
}

