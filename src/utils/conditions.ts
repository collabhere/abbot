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

    return queriesArr;
}