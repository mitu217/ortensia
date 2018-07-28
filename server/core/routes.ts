import { Router } from 'express'

const router = Router()

router.get('/nav', function(req, res, next) {
    let ctx = [
      { title: 'Nuxt.js', path: 'https://nuxtjs.org/' },
      { title: 'Express', path: 'http://expressjs.com/' },
      { title: 'Typescript', path: 'https://www.typescriptlang.org/' }
    ]
    res.json(ctx);
});

export default router;