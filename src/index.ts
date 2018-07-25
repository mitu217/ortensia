'use strict';

import {CronJob} from 'cron';
import * as express from 'express';
import {scraping} from './haruka';

const createApp = () => {
    // setup cron job
    const job = new CronJob('0 * * * * *', () => {
        scraping()
    });
    job.start();

    // setup application
    let app = express();
    app.get('/haruka', scrapingAction);
    return app;
}

const scrapingAction = async (request: any, response: any) => {
    const releaseItems = await scraping();
    return response.json({ music: releaseItems })
};

const app = createApp();
app.listen(8080);
