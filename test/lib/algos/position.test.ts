import { expect } from 'chai';
import { mockReporter } from '../../mock/reporter';
import { getPositionDetails, positionAnalysis } from '../../../src/lib/algos/position';

describe ("GetPositionDetails", () => {

    it ("Gets the position details for different field types", () => {
        const queryFieldTypes = {
            equality: ['field_1', 'field_3'], sort: ['field_5'], range: ['field_2', 'field_4']
        };

        const indexKeys = ['field_1', 'field_2', 'field_3', 'field_4','field_5'];

        const positionDetails = getPositionDetails(queryFieldTypes, indexKeys);

        expect(positionDetails).to.exist;
        expect(positionDetails.rightMostEqualityPosition).to.eq(2);
        expect(positionDetails.rightMostRangePosition).to.eq(3);
        expect(positionDetails.rangeHops).to.be.an('array');
        expect(positionDetails.sortHops).to.be.an('array');
        expect(positionDetails.rangeHops[0].key).to.eq('field_2');
        expect(positionDetails.rangeHops[0].position).to.eq(1);
        expect(positionDetails.sortHops[0].key).to.eq('field_5');
        expect(positionDetails.sortHops[0].position).to.eq(4);
    });
});

describe("PositionAnalysis", () => {

    it("Suggests modifications based on positional analysis for a query", () => {
        const index = {
            name: 'TEST_INDEX',
            key: {
                field_1: 1,
                field_2: 1,
                field_3: 1,
                field_4: -1,
                field_5: 1
            }
        };

        const queryFieldTypes = {
            equality: ['field_1', 'field_3'], sort: ['field_5'], range: ['field_2', 'field_4']
        };

        const reporter = mockReporter('suggest', (name: string, type: string, fields: string[]) => {

            expect(name).to.eq('TEST_INDEX');
            expect(fields).to.be.an('array');
            expect(type).to.be.oneOf(['change_operation', 'change_index']);
            expect(fields[0]).to.be.oneOf(['field_2', 'field_5']);
        });

        positionAnalysis(reporter)(index.name, index.key, queryFieldTypes);
    });
});