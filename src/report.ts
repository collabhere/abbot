import fs from "fs";
import { createInterface } from "readline";
import path from "path";
import {
	REPORT_INDEX_PATH,
	REPORTING_PATH
} from "./utils/constants";

enum Reporters {
	html = "html",
	text = "text"
}

export interface ReportOptions {
	reporter: keyof typeof Reporters;
};

export const Report = (opts: ReportOptions) => {
	if (!(opts.reporter in Reporters)) {
		console.error("[ERR] Provided `reporter` is not supported. Please use one of the following values:", Object.keys(Reporters).join(", "));
		return;
	} else {
		if (fs.existsSync(REPORT_INDEX_PATH)) {
			const reporters = fs.readdirSync(path.join(__dirname, "reporters"));

			if (reporters.includes(opts.reporter)) {
				const state: any = {};
				let first = true;
				const reporter = require(path.join(__dirname, "reporters", opts.reporter))();

				const indexReader = createInterface({ input: fs.createReadStream(REPORT_INDEX_PATH) });

				indexReader.on("line", line => {
					const [fileName, query] = line.split("\|");
					const report = require(REPORTING_PATH + "/" + fileName + ".json");
					
					reporter.onQuery(state, {
						query,
						...report
					}, first);

					if (first) first = false;
				});

				indexReader.on("close", function() {
					reporter.onComplete(state);
				});

			} else {
				console.error("[ERR] Something went wrong. Couldn't find reporter.");
				return;
			}
		} else {
			console.log("Nothing to report!")
		}
	}
}
