import {AbbotOptions, ContextType} from '../utils/types'

export const Abbot = (context: ContextType) => (
	opts: AbbotOptions
) => {
	return {
		exec: () => { }
	};
}