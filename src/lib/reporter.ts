import fs from "fs";
import hash from "object-hash";
import path from "path";

import {
	REPORTING_PATH,
	REPORT_INDEX_PATH, 
} from "../utils/constants";

const REPORT_SYMBOL = Symbol("__report__");

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
			const hash = report.context.hash;
			const command = report.context.command;

			delete report.context;

			if (fs.existsSync(REPORTING_PATH)) {
				fs.rmdirSync(REPORTING_PATH, { recursive: true });
				fs.unlinkSync(REPORT_INDEX_PATH);
				fs.mkdirSync(path.join(REPORTING_PATH), { recursive: true });
			} else {
				fs.mkdirSync(path.join(REPORTING_PATH), { recursive: true });
			}

			fs.appendFileSync(
				REPORT_INDEX_PATH,
				hash + "| " + JSON.stringify(command)
			);
			fs.writeFileSync(
				path.join(REPORTING_PATH, hash + ".json"),
				JSON.stringify(report)
			);
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
