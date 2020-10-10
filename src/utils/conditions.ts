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
 * @param {Array.<Object>} expressionsArray - An array containing if queries and the final expression
 * @returns {Expression} - An object of the form: {ifs: [], expr: {}}   
 */
export const segregateIfs = (expressionsArray: {[k: string]: any}[]): Expression => {

    return  expressionsArray.reduce((queryAcc: any, query: any) => 
                               ((expressionsArray[expressionsArray.length - 1] === query) 
                                   ? queryAcc.expr = query
                                   : queryAcc.ifs.push(query), queryAcc),
                               {ifs: [], expr: {}});
}

/**
 * Converts a MongoDB $expr object into an array of all possible resulting expressions
 * @param {Object} condition - A MongoDB expression ($expr) object with a condition ($cond)
 * @returns {Array.<Expression>} - An array of objects of the form: {ifs: [], expr: {}}
 */
export const getPossibleExpressions = (expression: {[k: string]: any}): Array<Expression> => {
    let path = '';
    let stringifiedQueriesArr: any[] = [];

    const finalExpression = (expression.$cond && Array.isArray(expression.$cond)) 
                            ? {$cond: {if: expression.$cond[0], then: expression.$cond[1], else: expression.$cond[2]}}
                            : expression;

    traverseCondition(finalExpression, path, stringifiedQueriesArr);
    
    /* Convert a path string where elements are concatenated by '->' to an array of queries
       and separate the if queries with the final expression. */
    return stringifiedQueriesArr
            .map(val => val.split('->')
                .map((splitPath: string) => JSON.parse(splitPath)))
            .map((queryArr: {[k: string]: any}[]) => segregateIfs(queryArr));
}

/**
 * Converts an array of 'if' conditions of the form [{operator: [field1, field2]}] to the form [{field1: {operator: field2}}];
 * @param {Array.<Object>} ifConditions - An array of objects with a single key which is a MongoDB operator
 * @returns {Array.<Object>} - An array of objects that can pe parsed as a MongoDB query
 */
export const convertIfsToQueries = (ifConditions: {[k:string]: any}[]): {[k:string]: any}[] => {

    const isQueryField = (field: any) => (typeof field !== 'object' && field[0] === '$') ? true: false;

    const queries = ifConditions.map((ifObject: any) => {

        let ifConditions: any[] = ifObject.$and ? ifObject.$and : [ifObject];

        return ifConditions.reduce((acc: any, cond: any) => {
                        const operator = Object.keys(cond)[0];

                        if (isQueryField(cond[operator][0])) {
                            acc[cond[operator][0].replace('$','')] = {[operator]: cond[operator][1]};
                        } else if (isQueryField(cond[operator][1])) {
                            acc[cond[operator][1].replace('$','')] = {[operator]: cond[operator][0]};
                        }
                        
                        return acc;
                    }, {});
    });
    
    return queries;
}         

/**
 * If a query has an expression($expr) object, creates a separate query for each of those expressions 
 * @param {Object} query - The mongoDB query to be analysed
 * @returns {Array.<QueryExpression>} - An array of objects of the form {ifs: [], query: {}} 
 */
export const convertQueryExpressions = (query: {[k: string]: any}): Array<QueryExpression> => 
                                                (query['$expr'] && query['$expr']['$cond']) 
                                                    ? getPossibleExpressions(query['$expr'])
                                                        .map((val: Expression) => (
                                                            delete query.$expr,
                                                            {query: {...query, ...val.expr}, ifs: convertIfsToQueries(val.ifs)}
                                                        ))
                                                    : []