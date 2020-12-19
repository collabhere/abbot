import { writeFileSync } from "fs";

/*

{
	collection: "",
	context: "",
	type: "",
	id: "",
	conditions: [],
	suggestions: [
		{  }
	]
}

*/

const REPORT_SYMBOL = Symbol("__report__")

type ReportOptions = {
	type?: "stdout" | "file";
	format?: "json" | "txt";
	path?: string;
};

export const Reporter = (
	collection: string, query?: any,
	sort?: any, projection?: any,
	pipeline?: any[]
) => {
	const reporter = {
		[REPORT_SYMBOL]: {
			collection,
			type: "",
			suggestions: []
		} as { [k: string]: any },
		suggest: (index: string, suggestion: string, fields?: string[]) => {
			setReportProp("suggestions", { suggestion, index, fields });
		},
		context: (ctx: any) => setReportProp("context", JSON.stringify(ctx)),
		report: ({ type, format, path }: ReportOptions) => {
			console.log(getReport());
		}
	};
	
	const getReport = () => reporter[REPORT_SYMBOL];
	
	const getReportProp = (prop: string) => reporter[REPORT_SYMBOL][prop];
	
	const setReportProp = (prop: string, val: any) => {
		try {
			if (reporter[REPORT_SYMBOL][prop] instanceof Array)
				reporter[REPORT_SYMBOL][prop].push(val);
			else
				reporter[REPORT_SYMBOL][prop] = val;
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	};

	if (query) {
		setReportProp("type", "query");
	} else if (pipeline) {
		setReportProp("type", "aggregation");
	}

	return reporter;
};

export type Reporter = ReturnType<typeof Reporter>;
