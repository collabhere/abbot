import { expect } from 'chai';
import { Reporter } from '../../src/lib/reporter';
import { MongoIndexKey } from '../../src/utils/types';

describe("Reporter", () => {

    describe("Insert", () => {

        it ("tests insert with _reporter empty", () => { 

            const reporter = Reporter();

            reporter.insert('TEST_INDEX', {item: 'test_item'});

            expect(reporter._report).to.exist;
            expect(reporter._report).to.haveOwnProperty('TEST_INDEX');
            expect(reporter._report['TEST_INDEX']).to.be.an('array');
            expect(reporter._report['TEST_INDEX'][0]).to.haveOwnProperty('item');
            expect(reporter._report['TEST_INDEX'][0]['item']).to.eq('test_item');
        });

        it ("tests insert with _reporter not empty", () => { 

            const reporter = Reporter();
            reporter._report['TEST_INDEX'] = ['test_item'];

            reporter.insert('TEST_INDEX', {item: 'test_item_1'});

            expect(reporter._report).to.exist;
            expect(reporter._report).to.haveOwnProperty('TEST_INDEX');
            expect(reporter._report['TEST_INDEX']).to.be.an('array');
            expect(reporter._report['TEST_INDEX'][1]).to.haveOwnProperty('item');
            expect(reporter._report['TEST_INDEX'][1]['item']).to.eq('test_item_1');
        });
    });

    describe("Suggest", () => {

        it ("inserts suggestions into _report object", () => {

            const reporter = Reporter();

            reporter.suggest('TEST_INDEX', 'TEST_SUGGESTION', ['field_1', 'field_2']);

            expect(reporter._report).to.exist;
            expect(reporter._report).to.haveOwnProperty('TEST_INDEX');
            expect(reporter._report['TEST_INDEX']).to.be.an('array');
            expect(reporter._report['TEST_INDEX'][0]['suggestion']).to.eq('TEST_SUGGESTION');
            expect(reporter._report['TEST_INDEX'][0]['fields']).to.be.an('array');
            expect(reporter._report['TEST_INDEX'][0]['fields'][0]).to.eq('field_1');
        });
    });

    describe("SuggestOR", () => {

        it ("inserts suggestions into _report object -> OR relaton", () => {

            const reporter = Reporter();

            reporter.suggestOR('TEST_INDEX', { type: 'TEST_SUGGESTION', fields: ['field_1', 'field_2'] });

            expect(reporter._report).to.exist;
            expect(reporter._report).to.haveOwnProperty('TEST_INDEX');
            expect(reporter._report['TEST_INDEX']).to.be.an('array');
            expect(reporter._report['TEST_INDEX'][0]['relation']).to.eq('OR');
            expect(reporter._report['TEST_INDEX'][0]['suggestions']).to.be.an('array');
            expect(reporter._report['TEST_INDEX'][0]['suggestions'][0]['suggestion']).to.eq('TEST_SUGGESTION');
        });
    });

    describe("SuggestAND", () => {

        it ("inserts suggestions into _report object -> AND relation", () => {

            const reporter = Reporter();

            reporter.suggestAND('TEST_INDEX', { type: 'TEST_SUGGESTION', fields: ['field_1', 'field_2'] });

            expect(reporter._report).to.exist;
            expect(reporter._report).to.haveOwnProperty('TEST_INDEX');
            expect(reporter._report['TEST_INDEX']).to.be.an('array');
            expect(reporter._report['TEST_INDEX'][0]['relation']).to.eq('AND');
            expect(reporter._report['TEST_INDEX'][0]['suggestions']).to.be.an('array');
            expect(reporter._report['TEST_INDEX'][0]['suggestions'][0]['suggestion']).to.eq('TEST_SUGGESTION');
        });
    });
});