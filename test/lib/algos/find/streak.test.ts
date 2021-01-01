import { expect } from 'chai';
import { mockReporter } from '../../../mock/reporter';
import { checkStreak } from '../../../../src/lib/algos/find/streak';

describe("CheckStreak", () => {

    it("Suggests modifications based on streak analysis for a query", () => {
        const index = {
            name: 'TEST_INDEX',
            key: {
                field_1: 1,
                field_2: 1,
                field_3: 1,
                field_4: -1
            }
        };

        const queryFieldTypes = {
            equality: ['field_1', 'field_2'], sort: ['field_3'], range: []
        };

        const reporter = mockReporter('suggest', (name: string, type: string, fields: string[]) => {

            expect(name).to.eq('TEST_INDEX');
            expect(fields).to.be.an('array');
            expect(type).to.eq('ADD_FIELD_FOR_COVERED_QUERY');
            expect(fields[0]).to.eq('field_4');
        });

        checkStreak(reporter)(index.name, index.key, queryFieldTypes);
    });
});