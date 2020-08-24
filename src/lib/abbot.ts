import { AbbotOptions, Context } from '../utils/types'
import { analyse } from './analyse';

export const Abbot = (context: Context) => (
	opts: AbbotOptions
) => {
	return {
		exec: () => analyse(context)(opts.collection, opts.query, opts.sort, opts.project)
	};
}
