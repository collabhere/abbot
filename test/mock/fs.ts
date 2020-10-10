export const mockFs = (callback: any) => ({
    existsSync: () => true,
    promises: {
        writeFile: (path: string, objectToWrite: any) => {
            callback(path, objectToWrite);
            return Promise.resolve('done');
        }
    }
});