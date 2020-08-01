interface AbbotOptions {
	collection: string;
	query: any;
}

export const Abbot = context => (
	opts: AbbotOptions
) => {
	return {
		exec: () => { }
	};
}