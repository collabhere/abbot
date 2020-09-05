import { expect } from 'chai';
import { mockReporter } from '../../mock/reporter';
import { coverageForIndex } from '../../../src/lib/algos/coverage';

describe("CoverageForIndex", () => {

    it("Suggests modifications based on index coverage for a query", () => {
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
            equality: ['field_1'], sort: [], range: ['field_3']
        };

        const reporter = mockReporter('suggest', (name: string, type: string, fields: string[]) => {
            expect(name).to.eq('TEST_INDEX');
            expect(type).to.eq('add_field');
            expect(fields).to.be.an('array');
            expect(fields[0]).to.eq('field_2');
        });

        coverageForIndex(reporter)(index.name, index.key, queryFieldTypes);
    });
});
