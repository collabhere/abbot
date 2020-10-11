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
	type: "stdout" | "file";
	format: "json" | "txt";
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
			if (getReportProp("conditions").length > 0) {
				setReportProp("suggestions", {
					index,
					fields,
					suggestion,
				})
			} else {
				setReportProp("suggestions", { index, fields, suggestion, })
			}
		},
		context: (ctx: any) => setReportProp("context", JSON.stringify(ctx)),
		report: ({ type, format, path }: ReportOptions) => {
			switch (format) {
				//case "json": {
				//	const json = JSON.stringify(this._report, null, 4);
				//	switch (type) {
				//		case "stdout": {
				//			console.log(JSON.stringify(json, null, 2));
				//			break;
				//		}
				//		case "file": {
				//			if (!path)
				//				throw new Error(
				//					"Please provide a `path` value to `.report()` when using `file` type of reporting."
				//				);
				//			writeFileSync(path, json);
				//			break;
				//		}
				//		default: {
				//			throw new Error(
				//				`Reporting type not implemented for format: ${format}.`
				//			);
				//		}
				//	}
				//	break;
				//}
				//case "txt": {
				//	switch (type) {
				//		default: {
				//			throw new Error(
				//				`Reporting type not implemented for format: ${format}.`
				//			);
				//		}
				//	}
				//	break;
				//}
				//default: {
				//	throw new Error("Reporting format not implemented.");
				//}
			}
		}
	};
	
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
