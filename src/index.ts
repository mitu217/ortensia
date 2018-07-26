'use strict';

import {CronJob} from 'cron';
import * as express from 'express';
import {scraping, fetchAction} from './haruka';

const createApp = () => {
    // setup cron job
    const job = new CronJob('0 */5 * * * *', () => {
        scraping()
    });
    job.start();

    // setup application
    let app = express();
    app.get('/haruka/:year/:month', fetchAction);
    return app;
}

const app = createApp();
app.listen(8080);
