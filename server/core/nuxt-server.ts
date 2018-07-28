import * as  express from 'express';
import { Nuxt, Builder } from 'nuxt';

import api from '../api';

export default class NuxtServer {
    private static _instance: NuxtServer;

    private _app: any;
    private _host: string;
    private _port: number|string;

    protected constructor() {
        this._app = express();
        this._host = process.env.HOST || '127.0.0.1';
        this._port = process.env.PORT || 8080;
    }

    public static getInstance(): NuxtServer {
        if (!this._instance) {
            this._instance = new NuxtServer();
        }
        return this._instance
    }

    public run(): void {
        this._app.set('port', this._port);

        // import api routes
        this._app.use('/api', api);

        // import and seting nuxt.js options
        let config = require('../../nuxt.config');
        config.dev = !(process.env.NODE_ENV === 'production');

        // init nuxt.js
        const nuxt = new Nuxt(config);

        // build only int dev mode
        if(config.dev) {
            const builder = new Builder(nuxt);
            builder.build();
        }

        this._app.use(nuxt.render);

        this._app.listen(this._port);
        return;
    }
}