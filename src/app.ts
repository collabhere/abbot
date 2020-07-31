import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import {writeFilePromisified, mkdirPromisified} from './library/misc.lib';
dotenv.config();

(async () => {

    const connection = await mongoose.connect(process.env.dbase);
    console.log("Connected to db");
    const collections = await mongoose.connection.db.listCollections().toArray();


    await mkdirPromisified('indexStore', {recursive: true});
    
    await Promise.all(collections.map(async (collection) => {
        const indexes: any = await mongoose.model(collection.name, new mongoose.Schema({}, {strict: false})).listIndexes();
        const collName = indexes[0].ns.split('.')[1];
        const indexObj = new Object(); 
        const finalArr = indexes.map((index) => {
            return {key: index.key, name: index.name};
        });
        indexObj[collName] = finalArr;

        let finalJson = JSON.stringify(indexObj);
    
        await writeFilePromisified(`indexStore/${collName}.json`, finalJson);
    }));
})();