import * as Datastore from '@google-cloud/datastore';

const datastore = Datastore();

export const getChachName = (year: number, month: number) => {
    return `${year}_${month}.json`;
}

export const readDatastore = async (key: string) => {
    const query = datastore.createQuery(key).limit(1);
    return datastore.runQuery(query).then((results) => {
        return results[0];
    });
}

export const writeDatastore = async (key: string, data: any) => {
    datastore.save({
        key: datastore.key(key),
        data: {
            data: data
        }
    });
}

