export const traverseCondition = (condition: any, path:any, arr: any[]) => {

    path += (condition.$cond && condition.$cond.if) ? JSON.stringify(condition.$cond.if): JSON.stringify(condition);

    if (!(condition.$cond && condition.$cond['then']) 
            && !(condition.$cond && condition.$cond['else'])) {
        arr.push(path);
        return;
    }

    if (condition.$cond['then']) traverseCondition(condition.$cond['then'], path + '->', arr);
    if (condition.$cond['else']) traverseCondition(condition.$cond['else'], path + '->', arr);
}

export const getPossibleExpressions = (condition: any) => {
    let path = '';
    let arr: any[] = [];
    traverseCondition(condition, path, arr);
    const queriesArr = arr.reduce((acc, val) => {
        const splitArr: any[] = val.split('->');
        const queryArr = splitArr.reduce((accltr, value) => (accltr.push(JSON.parse(value)), accltr), []);
        acc.push(queryArr);
        return acc;
    }, []);

    const queriesObj = segregateIfs(queriesArr);

    return queriesObj;
}

export const segregateIfs = (expressionsArray: [{[k:string]: any}]) => {

 return expressionsArray.reduce((acc:any, queryCombination: any) => {
            let exprObj =  queryCombination.reduce((queryAcc: any, query: any) => 
                            ((queryCombination[queryCombination.length - 1] === query) 
                                ? queryAcc.expr = query
                                : queryAcc.ifs.push(query), queryAcc),
                            {ifs: [], expr: {}});

            acc.push(exprObj);
            return acc;

        }, []);
}