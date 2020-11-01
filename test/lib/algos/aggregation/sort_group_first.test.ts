import { expect } from 'chai';
import { sortBeforeGroupFirst } from '../../../../src/lib/algos/aggregation/sort_group_first';
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
            {
                $group: {
                        _id: "$groupedBy",
                        y: {$first: "$field1"}
                }
            },
            {$sort: {field2: 1}}
        ];

        const reporter = mockReporter('suggest', (index, type, fields) => {
            expect(index).to.eq("sortIndex");
            expect(type).to.eq(SUGGESTION_TYPES.SORT_GROUP_FIRST);
            expect(fields).to.be.an('array');
            expect(fields.length).to.eq(1);
            expect(fields[0]).to.eq("field1");
        });

        sortBeforeGroupFirst(reporter)("sortIndex", sortIndex, [[], aggregation]);
    });
});