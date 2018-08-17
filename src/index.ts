'use strict';

import * as  express from 'express';
import api from './api';

const app = express();

(async () => {
    const port = process.env.PORT || 8080;

    app.set('port', port);
    app.use('/api', api);
    app.listen(port, () => {
        console.log(`Listening on port ${port}`)
    });
})();

// for cloud functions
exports.ortensia = app;