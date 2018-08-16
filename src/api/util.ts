import * as Datastore from '@google-cloud/datastore';

const datastore = Datastore();

export const getChachName = (year: number, month: number) => {
    return `${year}_${month}`;
}

export const readCache = async (year: number, month: number): Promise<Object[]> => {
    const cacheName = getChachName(year, month);
    return await readDatastore(cacheName).then(async (res) => {
        if (!Object.keys(res).length) {
            return [];
        }
        return res[0].data;
    }).catch(err => {
        console.error(err);
        return [];
    });
}

export const writeCache = async (year: number, month: number, data: any) => {
    console.info(`write cache: ${year}_${month}`);
    const cacheName = getChachName(year, month);
    await writeDatastore(cacheName, data);
}

const readDatastore = async (key: string) => {
    const query = datastore.createQuery(key).limit(1);
    return datastore.runQuery(query).then((results) => {
        return results[0];
    });
}

const writeDatastore = async (key: string, data: any) => {
    const transaction = datastore.transaction();
    transaction.run().then(async () => {
        let entity = await readDatastore(key);
        if (!Object.keys(entity).length) {
            entity = {
                key: datastore.key(key),
                data: {
                    data: data
                },
            };
        }
        datastore.save(entity);
        return transaction.commit();
    })
    .catch(() => transaction.rollback());
}

