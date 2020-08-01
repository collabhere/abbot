
export const validateContext = function (
	context
) {
	if (!context.mongooseInstance) {
		throw new Error("[abbot] No mongoose instance provided to abbot. Provide a mongoose instance to .prepare()");
	}
}
