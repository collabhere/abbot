export const mockReporter = (funcName: string, callback: any) => {

    const throwError = () => {
        throw new Error("Invalid call. Please provide correct function name to the mock reporter.");
    }

    return {
        _report: {},
        setup: function (collection: string, query: any, sort: any, projection: any) { 
            funcName === 'setup'? callback(collection, query, sort, projection) : throwError();
        },
        insert: function (index: string, item: any) {
            funcName === 'insert'? callback(index, item) : throwError();
        },
        suggest: function (index: string, type: string, fields: string[]) {
            funcName === 'suggest'? callback(index, type, fields) : throwError();
        },
        suggestOR: function (index: string, ...suggestions: { type: string; fields: string[]; }[]) {
            funcName === 'suggestOR'? callback(index, ...suggestions) : throwError();
        },
        suggestAND: function (index: string, ...suggestions: { type: string; fields: string[]; }[]) {
            funcName === 'suggestAND'? callback(index, ...suggestions) : throwError();
        },
        suggestNewIndex: function (type: string, key: {}) {
            funcName === 'suggestNewIndex'? callback(type, key) : throwError();
        },
        report: function ({ type, format, path }) {
            funcName === 'suggestAND'? callback(type, format, path) : throwError();
        }
    }
}