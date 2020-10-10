import { expect } from 'chai';
import { getQueryFieldTypes, isEquality } from '../../src/utils/query';

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