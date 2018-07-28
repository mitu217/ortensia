import { Router } from 'express';
import * as fs from 'fs';

const routers = Router();

// setup api routing
(async function () {
    const items = fs.readdirSync(__dirname);
    await Promise.all(items.map(async item => {
        if (fs.statSync(`${__dirname}/${item}`).isDirectory()) {
            const router = await import(`./${item}`);
            routers.use(`/${item}`, router.default);
        }
    })).catch(err => console.error(err));
})();

export default routers;