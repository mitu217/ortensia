import * as  express from 'express';
import api from '../api';

export default class Server {
    private static _instance: Server;

    private _app: any;
    private _port: number|string;

    protected constructor() {
        this._app = express();
        this._port = process.env.PORT || 3000;
    }

    public static getInstance(): Server {
        if (!this._instance) {
            this._instance = new Server();
        }
        return this._instance
    }

    public run(): void {
        this._app.set('port', this._port);
        this._app.use('/api', api);
        this._app.listen(this._port, () => {
            console.log(`Listening on port ${this._port}`)
        });
        return;
    }
}