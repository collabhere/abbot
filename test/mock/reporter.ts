import { REPORT_SYMBOL } from "../../src/lib/reporter";

export const mockReporter = (funcName: string, callback: any) => {

    const throwError = () => {
        throw new Error("Invalid call. Please provide correct function name to the mock reporter.");
    }

    return {
        [REPORT_SYMBOL]: { val: 1 } as {[k: string]: any},
        suggest: function (index: string, suggestion: string, fields?: string[]) {
            if (funcName === 'suggest') callback(index, suggestion, fields);
            else throwError();
        },
        report: function () {
            if (funcName === 'report') callback();
            else throwError();
        },
        context: function (arg: any) {
            if (funcName === 'report') callback(arg);
            else throwError();
            return true;
        }
    }
}