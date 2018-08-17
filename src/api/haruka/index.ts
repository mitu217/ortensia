import { fetchAction } from './haruka';
import { Router } from 'express';

const router = Router({mergeParams: true});

/* GET fetch release schedules */
router.get('/', fetchAction);

export default router;
