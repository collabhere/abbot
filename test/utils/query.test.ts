import { expect } from 'chai';
import { getQueryFieldTypes, isEquality, conditionParser } from '../../src/utils/query';

describe("ConditionParser", () => {

    it ("parses a query with $cond operator -> array", () => {
        const condition  = [(1 > 1), 1, 2];
        const parsedCondition = conditionParser(condition);

        expect(parsedCondition).to.exist;
        expect(parsedCondition.then).to.eq(1);
        expect(parsedCondition.else).to.eq(2);
    });

    it ("parses a query with $cond operator -> object", () => {
        const condition = {
            if: (2 > 3),
            then: 4,
            else: 3
        };

        const parsedCondition = conditionParser(condition);

        expect(parsedCondition).to.exist;
        expect(parsedCondition.then).to.eq(4);
        expect(parsedCondition.else).to.eq(3);
    });

});

describe("IsEquality", () => {

    it ("Checks whether a field is equality or range -> equality field", () => {
        const field = {$eq: 24};
        const isEqualityField = isEquality(field);

        expect(isEqualityField).to.exist;
        expect(isEqualityField).to.eq(true);
    });

    it ("Checks whether a field is equality or range -> range field", () => {
        const field = {$gt: 24, $lt: 35};
        const isEqualityField = isEquality(field);

        expect(isEqualityField).to.exist;
        expect(isEqualityField).to.eq(false);
    });

    describe("IsEquality --> $cond and $expr", () => {

        it ("Checks whether a field is equality or range -> both equality fields", () => {

            const field = {
                $expr: {
                    $cond: [(2 > 3), 2, 3]
                }
            }
    
            const isEqualityField = isEquality(field);
    
            expect(isEqualityField).to.exist;
            expect(isEqualityField).to.eq(true);
    
        });

        it ("Checks whether a field is equality or range -> both range fields", () => {

            const field = {
                $expr: {
                    $cond: [(2 > 3), {$gt: 2}, {$lt: 3}]
                }
            }
    
            const isEqualityField = isEquality(field);
    
            expect(isEqualityField).to.exist;
            expect(isEqualityField).to.eq(false);
    
        });

        it ("Checks whether a field is equality or range -> equality and range fields", () => {

            const field = {
                $expr: {
                    $cond: [(2 > 3), 2, {$lt: 3}]
                }
            }
    
            const isEqualityField = isEquality(field);
    
            expect(isEqualityField).to.exist;
            expect(isEqualityField).to.eq(false);
    
        });

        it ("Checks whether a field is equality or range -> condition within a condition", () => {

            const field = {
                $expr: {
                    $cond: [
                        (2 > 3), 
                        2, 
                        {
                            $expr: {
                                $cond: {
                                    if: (1 > 2),
                                    then: 1,
                                    else: { $size: ['1', '2'] }
                                }
                            }
                        }
                    ]
                }
            }
    
            const isEqualityField = isEquality(field);
    
            expect(isEqualityField).to.exist;
            expect(isEqualityField).to.eq(true);
        });
    });
});

describe("QueryFieldTypes", () => {

    it ("Separates the query into arrays based on the types of fields", () => {

        const query = {
			age: {
				$gte: 50,
				$lte: 150
			},
			hornLength: 50
        };

        const sort = {
            hornLength: -1
        };
        
        const finalObject = getQueryFieldTypes(query, sort);

        expect(finalObject).to.exist;
        expect(finalObject.equality).to.be.an('array');
        expect(finalObject.range).to.be.an('array');
        expect(finalObject.sort).to.be.an('array');
        expect(finalObject.equality.length).to.eq(1);
        expect(finalObject.sort.length).to.eq(1);
        expect(finalObject.range.length).to.eq(1);
    });
});

