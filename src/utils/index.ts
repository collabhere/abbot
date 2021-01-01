export const isObj = (x: any): boolean => x && typeof x === "object";

export const isInt = (x: any): boolean => /^\d+$/.test(String(x));

export const assocPathGet = (target: any, path: string) => {
	try {
		if (path.includes(".")) {
			const keys = path.split(".");
			const length = keys.length;
			const lastIndex = (keys.length - 1);
			let i = 0;
			let seen = target;
			while (seen != null && i < length) {
				const key = keys[i];
				if (i !== lastIndex) {
					seen[key] =
						isObj(seen[key])
							? seen[key]
							: isInt(keys[i + 1])
								? []
								: {};
				} else {
					return seen[key];
				}
				seen = seen[key];
				++i;
			}
		} else {
			return target[path];
		}
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

export const assocPathSet = (target: any, path: string, value: any) => {
	try {
		if (path.includes(".")) {
			const keys = path.split(".");
			const length = keys.length;
			const lastIndex = (keys.length - 1);
			let i = 0;
			let seen = target;
			while (seen != null && i < length) {
				const key = keys[i];
				if (i !== lastIndex) {
					seen[key] =
						isObj(seen[key])
							? seen[key]
							: isInt(keys[i + 1])
								? []
								: {};
				} else {
					seen[key] = value;
				}
				seen = seen[key];
				++i;
			}
		} else {
			target[path] = value;
		}
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

export const assocPathMax = (arr: any[], path: string) => arr.reduce((prev, current) => (assocPathGet(prev, path) > assocPathGet(current, path)) ? prev : current);

export const max = (arr: any[], key: string) => arr.reduce((prev, current) => (prev[key] > current[key]) ? prev : current);

export const findIndexesByVal = (arr: any[], checkValue: string) => {
	return arr.reduce((acc, val, index) => {
		if (val == checkValue) {
			acc.push(index);
		}
		return acc;
	}, []);
}

export const between = (x: number, min: number, max: number) => (x >= min && x <= max);

export const pipe = (...fns: Function[]) => (x: any) => fns.reduce((v, f) => f(v), x);
