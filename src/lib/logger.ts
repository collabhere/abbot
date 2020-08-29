export const Logger = (
	opts: { debugInfo: boolean }
) => ({
	log: (...args: any[]) => {
		if (opts.debugInfo) {
			console.log(...args);
		}
	}
});

export type Logger = ReturnType<typeof Logger>;
