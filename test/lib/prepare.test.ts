import { expect } from 'chai';
import { fetch } from '../../src/lib/prepare';
import { mockMongoClient } from '../mock/mongoclient';
import { mockFs } from '../mock/fs';
import { MongoClient } from 'mongodb';

describe ("Fetch", () => {
    it ("Fetches indexes from the db and writes to the store", () => {

        const fsMock = mockFs((path: string, objectToWrite: any) => {
            expect(objectToWrite).to.exist;
            const parsedObject = JSON.parse(objectToWrite);
            expect(parsedObject).to.haveOwnProperty('TEST_COLLECTION');
            expect(parsedObject['TEST_COLLECTION']).to.be.an('array');
            expect(parsedObject['TEST_COLLECTION'][0]).to.haveOwnProperty('key');
            expect(parsedObject['TEST_COLLECTION'][0]).to.haveOwnProperty('name');
        });

        const mockDbClient = mockMongoClient() as unknown as MongoClient;

        fetch(mockDbClient, ['TEST_COLLECTION'], fsMock);
    });
});