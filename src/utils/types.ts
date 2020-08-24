import { Mongoose } from "mongoose";

export interface IQueryFieldTypes {
	equality: string[];
	sort: string[];
	range: string[];
}

export type JSObject = { [k: string]: any }

export interface StoredIndexType {
	[k:string]: {
		key: {
			[key:string]: 1|-1
		};
		name: string;
	}[]
}

export interface IndexDetailsType {
	key?: {
		[key: string]: 1|-1
	};
	name?: string;
	coverage?: CoverageType;
	keyWiseDetails?: PositionDetailsType;
	fieldStreak?: number;
}

export interface CoverageType {
	coveredCount: number;
	totalCount: number;
	uncoveredFields: string[];
}

export interface PositionDetailsType {
	rangeHops: number[];
	sortHops: number[];
	rangeMax: number;
	equalityMax: number;
}

export interface ContextType {
	mongooseInstance: Mongoose;
	report?: AnalysisReport[];
}

export interface AbbotOptions {
	collection: string;
	query: any;
}

export interface PrepareOptions {
	mongooseInstance: Mongoose;
	collections: string[];
}

export interface AnalysisReport {
	suggestion?: string;
	indexName?: string;
	fields?: string[];
}


