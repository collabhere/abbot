import fs from "fs";
import hash from "object-hash";

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

const REPORT_SYMBOL = Symbol("__report__");

//const truncate = (str: string, len: number) => str.length > len ? str.substring(0, len) + "..." : str;

const REPORTING_PATH = process.cwd() + "/.abbot";

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
		context: (ctx: any) => setReportProp("context", { hash: hash(ctx), command: JSON.stringify(ctx) }),
		report: () => {
			const report = getReport();

			if (fs.existsSync(REPORTING_PATH)) {
				fs.rmdirSync(REPORTING_PATH, { recursive: true });
				fs.mkdirSync(REPORTING_PATH + "/reports", { recursive: true });
			} else {
				fs.mkdirSync(REPORTING_PATH + "/reports", { recursive: true });
			}

			fs.writeFileSync(REPORTING_PATH + "/reports/" + report.context.hash + ".json", JSON.stringify(report.suggestions));
			fs.appendFileSync(REPORTING_PATH + "/reports.index", report.context.hash + ": " + JSON.stringify(report.context.command))
			
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
