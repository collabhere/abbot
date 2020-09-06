import { expect } from 'chai';
import { newIndexSuggestion } from '../../../src/lib/algos/esr';
import { mockReporter } from '../../mock/reporter';
import { report } from 'process';

describe("NewIndexSuggestions", () => {

    it ("suggests new indexes for unsupported queries", () => {

        const queryFieldTypes = { equality: ['field1', 'field2'], sort: ['field3'], range: ['field4', 'field5']};

        const reporter = mockReporter("suggest", (name: 'string', type: string) => {
            expect(type).to.eq('create_new_index');
            expect(name).to.eq('field1_1_field2_1_field3_1_field4_1_field5_1');
        });

        newIndexSuggestion(reporter)(queryFieldTypes);
    });
});