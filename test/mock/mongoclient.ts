export const mockMongoClient = () => ({
    db: () => ({
        collection: (collection: string) => ({
            indexes: () => [{
                    name: 'TEST_INDEX',
                    key: {
                        field_1: 1,
                        field_2: 1,
                        field_3: 1,
                        field_4: -1
                    }
                }]
        })
    })
})