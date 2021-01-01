import { expect } from 'chai';
import { mockReporter } from '../../../mock/reporter';
import { coverageForIndex } from '../../../../src/lib/algos/find/coverage';
import { SUGGESTION_TYPES } from '../../../../src/utils/constants';

describe("CoverageForIndex", () => {

    it("Suggests modifications based on index coverage for a query --> without projection", () => {
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
            expect(type).to.eq(SUGGESTION_TYPES.ADD_FIELDS_TO_INDEX);
            expect(fields).to.be.an('array');
            expect(fields[0]).to.eq('field_2');
        });

        coverageForIndex(reporter)(index.name, index.key, queryFieldTypes, {});
    });

    describe ("CoverageForIndex --> with projection", () => {

        it ("Suggests modifications based on index coverage for a query --> uncovered", () => {
            const index = {
                name: 'TEST_INDEX',
                key: {
                    field_1: 1,
                    field_2: 1,
                    field_3: 1,
                }
            };
    
            const queryFieldTypes = {
                equality: ['field_1', 'field_2'], sort: [], range: ['field_3']
            };

            const projection = {
                field_1: 1,
                field_4: 1
            }

            const reporter = mockReporter("suggest", (indexName: string, type: string, fields: string[]) => {
                expect(indexName).to.eq('TEST_INDEX');
                expect(type).to.eq(SUGGESTION_TYPES.REMOVE_FIELDS_FROM_PROJECTION);
                expect(fields).to.be.an('array');
                expect(fields.length).to.eq(1);
                expect(fields[0]).to.eq('field_4');
            });

            coverageForIndex(reporter)(index.name, index.key, queryFieldTypes, projection);
        });

        it ("Suggests modifications based on index coverage for a query --> covered", () => {
            const index = {
                name: 'TEST_INDEX',
                key: {
                    field_1: 1,
                    field_2: 1,
                    field_3: 1,
                }
            };
    
            const queryFieldTypes = {
                equality: ['field_1', 'field_2'], sort: [], range: ['field_3']
            };

            const projection = {
                field_1: 1,
            }

            const reporter = mockReporter("suggest", (indexName: string, type: string) => {
                expect(indexName).to.eq('TEST_INDEX');
                expect(type).to.eq(SUGGESTION_TYPES.REMOVE_ID_PROJECTION_FROM_PROJECTION);
            });

            coverageForIndex(reporter)(index.name, index.key, queryFieldTypes, projection);
        });
    });
});
