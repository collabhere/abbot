import { expect } from "chai";
import { mockReporter } from "../../../mock/reporter";
import { matchBeforeGroup } from "../../../../src/lib/algos/aggregation/match_group";
import { MongoIndexKey } from "../../../../src/utils/types";
import { SUGGESTION_TYPES } from '../../../../src/utils/constants';

describe("MatchBeforeGroup", () => {
    it("Suggests moving $match stages based on the $group stages", () => {

        const fieldIndex = {
            field2: 1
        } as MongoIndexKey;

        const aggregation = [
            {
                $group: {
                        _id: "$groupedBy",
                        fieldToCheck: {$sum: "$field1"}
                }
            },
            {$match: {field1:1, field2: 'value'}},
            {$match: {fieldToCheck: {$gt: 30}}}
        ];

        const reporter = mockReporter('suggest', (index, type, fields) => {
            expect(fields).to.exist;
            expect(index).to.eq("fieldIndex");
            expect(type).to.eq(SUGGESTION_TYPES.MATCH_BEFORE_EVERYTHING)
            expect(fields).to.haveOwnProperty('field1');
            expect(fields).to.not.haveOwnProperty("fieldToCheck");
        });

        matchBeforeGroup(reporter)("fieldIndex", fieldIndex, [[], aggregation]);
    });
});
