import { fetchAction } from './haruka';
import { Router } from 'express';

const router = Router({mergeParams: true});

/* GET release items */
router.get('/fetch/:year/:month', fetchAction);

export default router;
