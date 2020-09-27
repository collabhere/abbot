import { expect } from 'chai';
import { getPossibleExpressions, convertQueryExpressions, convertIfsToQueries } from '../../src/utils/conditions';

describe("ConditionParser", () => {

    it ("parses a query with $cond operator -> array", () => {
        let obj = {
            $cond:{
                if: {$eq: ["$field1", "$field2"]},
                then: {
                    $cond: {
                        if: {$ne: ["$field3", "$field4"]},
                        then: {"$field5": {$in: ["value1", "value2"]}},
                        else: {"$field5": 'g'}
                    }
                },
                else: {
                    $cond: {
                        if: {$eq: [{$size: [1,2]}, 2]},
                        then: {
                            $cond: {
                                if: 'c',
                                then: {"$field6": {$in: ["value3", "value4"]}},
                                else: {"$field7": {$in: ["value5", "value6"]}}
                            }
                        },
                        else: {"$field8": {$gt: 20}}
                    }
                }
            }
        }
        
        const possibleQueries = getPossibleExpressions(obj);

        expect(possibleQueries).to.exist;
        expect(possibleQueries.length).to.eq(5);
        expect(possibleQueries[0].ifs).to.be.an('array');
        expect(possibleQueries[0].ifs.length).to.eq(2);
        expect(possibleQueries[0].expr).to.haveOwnProperty('$field5');
        expect(possibleQueries[2].ifs).to.be.an('array');
        expect(possibleQueries[2].ifs.length).to.eq(3);
        expect(possibleQueries[2].expr).to.haveOwnProperty('$field6');
        expect(possibleQueries[4].ifs).to.be.an('array');
        expect(possibleQueries[4].ifs.length).to.eq(2);
        expect(possibleQueries[4].expr).to.haveOwnProperty('$field8');
    });
});

describe("convertQueryExpressions", () => {

    it ("converts a query to a QueryExpression object -> with $expr", () => {
        let query = {
            $field1: 'a',
            $field2: 'b',
            $field3: {$in: ['c', 'd']},
            $expr: {
                $cond:{
                    if: {$eq: ["$field1", "$field2"]},
                    then: {
                        $cond: {
                            if: {$ne: ["$field3", "$field4"]},
                            then: {"$field5": {$in: ["value1", "value2"]}},
                            else: {"$field5": 'g'}
                        }
                    },
                    else: {
                        $cond: {
                            if: {$eq: [{$size: [1,2]}, 2]},
                            then: {
                                $cond: {
                                    if: {$eq: ['$fieldx', 1]},
                                    then: {"$field6": {$in: ["value3", "value4"]}},
                                    else: {"$field7": {$in: ["value5", "value6"]}}
                                }
                            },
                            else: {"$field8": {$gt: 20}}
                        }
                    }
                }
            }
        }
        
        const expressionsObject = convertQueryExpressions(query);
        expect(expressionsObject).to.exist;
        expect(expressionsObject).to.be.an('array');
        expect(expressionsObject.length).to.eq(5);
        expect(expressionsObject[0]).to.haveOwnProperty('ifs');
        expect(expressionsObject[1]).to.haveOwnProperty('query');
    });

    it ("converts a query to a QueryExpression object -> without $expr", () => {
        let query = {
            $field1: 'a',
            $field2: 'b',
            $field3: {$in: ['c', 'd']}
        }
        
        const expressionsObject = convertQueryExpressions(query);
        expect(expressionsObject).to.exist;
        expect(expressionsObject).to.be.an('array');
        expect(expressionsObject.length).to.eq(0);
    });
});

describe("ConvertIfsToQueries", () => {

    it("Converts 'if' conditions to parsable Queries --> with $and", () => {
        const ifs = [
            {
                $and: [
                    {$eq: ["$field1", "$field2"]},
                    {$gt: [12, "$field3"]},
                    {$lt: [{$size: "$field4"}, "$field5"]}
                ]
            },
            {
                $eq: ['$field1', '$field2']
            }
        ]

        const queries = convertIfsToQueries(ifs);
        expect(queries).to.exist;
        expect(queries).to.be.an('array');
        expect(queries[0]).to.haveOwnProperty("field1");
        expect(queries[0]).to.haveOwnProperty("field3");
        expect(queries[0]).to.haveOwnProperty("field5");
        expect(queries[1]).to.haveOwnProperty("field1");
    });

    it("Converts 'if' conditions to parsable Queries --> without $and", () => {
        let obj = {
            $cond:{
                if: {$gt: [12, "$field3"]},
                then: {"$field7": {$gt: 20}},
                else: {"$field8": {$gt: 20}}
            }
        }

        const queries = convertIfsToQueries([obj.$cond.if]);
        expect(queries).to.exist;
        expect(queries).to.be.an('array');
        expect(queries[0]).to.haveOwnProperty("field3");
    });
});
