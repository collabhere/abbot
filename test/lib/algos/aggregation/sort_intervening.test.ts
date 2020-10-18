import { expect } from 'chai';
import { sortBeforeInterveningStages } from '../../../../src/lib/algos/aggregation/sort_intervening';
import { mockReporter } from '../../../mock/reporter';
import { SUGGESTION_TYPES } from '../../../../src/utils/constants';
import { MongoIndexKey } from '../../../../src/utils/types';

describe("SortBeforeGroupFirst", () => {
    it("Suggests moving or adding $sort stages based on the $group stages with $first", () => {
        const sortIndex = {
            field2: 1
        } as MongoIndexKey

        const aggregation = [
            {$match: {field1:1, field2: 'value'}},
            {$unwind: '$field3'},
            {
                $group: {
                        _id: "$groupedBy",
                        count: {$sum: 1}
                }
            },
            {$sort: {field2: 1}}
        ];

        const reporter = mockReporter('suggest', (index, type, sortFields) => {
            expect(index).to.eq("sortIndex");
            expect(type).to.eq(SUGGESTION_TYPES.SORT_BEFORE_INTERVENE);
            expect(sortFields).to.be.an('array');
            expect(sortFields.length).to.eq(1);
            expect(sortFields[0]).to.eq("field2");
        });

        sortBeforeInterveningStages(reporter)("sortIndex", sortIndex, [[], aggregation]);
    });
});