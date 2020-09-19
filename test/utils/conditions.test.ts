import { expect } from 'chai';
import { getPossibleExpressions } from '../../src/utils/conditions';

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
