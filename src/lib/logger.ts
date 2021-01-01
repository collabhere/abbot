export const logger = ({
	log: (...args: any[]) => {
		if (process.env.DEBUG_ABBOT) {
			let str = '';
			args.forEach((segment, i) => {
				switch (i) {
					case 0: {
						str += ("Fn: " + segment + " ");
						break;
					}
					case 1: {
						str += ("msg: " + segment + " ");
					}
				}
			});
			console.log(str);
		}
	}
});

export type Logger = typeof logger;
