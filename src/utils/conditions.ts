import { Expression, QueryExpression } from './types';

/**
 * Traverses a MongoDB $cond object and recursively generates all possible expressions
 * @param {Object} condition - A MongoDB expression ($expr) object with a condition ($cond)
 * @param {string} path - The string that combines every element in a possible path
 * @param {Array.<string>} possiblePaths - The array that stores all possible paths (expressions)
 */
export const traverseCondition = (condition: {[K: string]: any}, path: string, possiblePaths: string[]): void => {

    path += (condition.$cond && condition.$cond.if) ? JSON.stringify(condition.$cond.if): JSON.stringify(condition);

    if (!(condition.$cond && condition.$cond['then']) 
            && !(condition.$cond && condition.$cond['else'])) {
        possiblePaths.push(path);
        return;
    }

    if (condition.$cond['then']) traverseCondition(condition.$cond['then'], path + '->', possiblePaths);
    if (condition.$cond['else']) traverseCondition(condition.$cond['else'], path + '->', possiblePaths);
}

/**
 * Converts an array of expressions to an object with all 'if' queries as a separate key
 * @param {Array.<Array.<Object>>} expressionsArray - A 2D array containing queries in all possible expressions
 * @returns {Array.<Expression>} - An array of objects of the form: {ifs: [], expr: {}}   
 */
export const segregateIfs = (expressionsArray: [{[k: string]: any}]): Array<Expression> => {

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

/**
 * Converts a MongoDB $expr object into an array of all possible resulting expressions
 * @param {Object} condition - A MongoDB expression ($expr) object with a condition ($cond)
 * @returns {Array.<Expression>} - An array of objects of the form: {ifs: [], expr: {}}
 */
export const getPossibleExpressions = (condition: {[k: string]: any}): Array<Expression> => {
    let path = '';
    let arr: any[] = [];

    traverseCondition(condition, path, arr);

    const queriesArr = arr.reduce((acc, val) => {

        //Convert a path string where elements are concatenated by '->' to an array of elements 
        const splitArr: any[] = val.split('->');
        const queryArr = splitArr.reduce((accltr, value) => (accltr.push(JSON.parse(value)), accltr), []);

        acc.push(queryArr);
        return acc;
    }, []);

    const queriesObj = segregateIfs(queriesArr);

    return queriesObj;
}

/**
 * If a query has an expression($expr) object, creates a separate query for each of those expressions 
 * @param {Object} query - The mongoDB query to to analysed
 * @returns {Array.<QueryExpression>} - An array of objects of the form {ifs: [], query: {}} 
 */
export const convertQueryExpressions = (query: {[k: string]: any}): Array<QueryExpression> => 
                                                    (query['$expr'] && query['$expr']['$cond']) 
                                                        ? getPossibleExpressions(query['$expr'])
                                                            .reduce((acc: any, val: Expression) => (
                                                                delete query.$expr,
                                                                acc.push({query: {...query, ...val.expr}, ifs: val.ifs}),
                                                                acc
                                                            ), [])
                                                        : [{query}];