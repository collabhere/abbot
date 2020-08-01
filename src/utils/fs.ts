import { writeFile as _writeFile, mkdir as _mkdir } from 'fs';

export const writeFile =
	(file: string, data: string) =>
		new Promise((resolve, reject) => {
			_writeFile(file, data, (err) => {
				if (err) {
					reject(err);
				}
				resolve();
			});
		});

export const mkdir =
	(name: string, options: {}) =>
		new Promise((resolve, reject) => {
			_mkdir(name, options, (err) => {
				if (err) {
					reject(err);
				}
				resolve();
			});
		});