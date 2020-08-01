interface AbbotOptions {
	collection: string;
	query: any;
}

export const Abbot = state => (
	opts: AbbotOptions
) => {

	return {
		exec: () => { }
	};
}