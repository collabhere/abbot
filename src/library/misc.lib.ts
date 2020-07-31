import {writeFile, mkdir} from 'fs';


export function writeFilePromisified (file: string, data: string) {

    return new Promise((resolve, reject) => {
        writeFile(file, data, (err) => {
            if (err) {
                reject(err);;
            }
            resolve('done');
        });
    });
}

export function mkdirPromisified (name: string, options: {}) {

    return new Promise((resolve, reject) => {
        mkdir(name, options, (err) => {
            if (err) {
                reject(err);;
            }
            resolve('done');
        });
    });
}