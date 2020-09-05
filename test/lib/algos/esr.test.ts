import { expect } from 'chai';
import { newIndexSuggestion } from '../../../src/lib/algos/esr';
import { mockReporter } from '../../mock/reporter';
import { report } from 'process';

describe("NewIndexSuggestions", () => {

    it ("suggests new indexes for unsupported queries", () => {

        const queryFieldTypes = { equality: ['field_1', 'field_2'], sort: ['field_3'], range: ['field_4', 'field_5']};

        const reporter = mockReporter("suggestNewIndex", (type: string, key: {}) => {
            expect(type).to.eq('create_new_index');
            expect(key).to.exist;
            
            const indexKeys = Object.keys(key);

            expect(indexKeys[0]).to.eq('field_1');
            expect(indexKeys[2]).to.eq('field_3');
            expect(indexKeys[3]).to.eq('field_4');
        });

        newIndexSuggestion(reporter)(queryFieldTypes);
    });
});