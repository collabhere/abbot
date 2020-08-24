import { Context } from "../utils/types";

export const Logger = (
	context: Context
) => ({
	log: (...args: any[]) => {
		if (context.debugInfo) {
			console.log(...args);
		}
	}
});

export type Logger = ReturnType<typeof Logger>;
