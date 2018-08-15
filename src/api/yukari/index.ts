import { exportCalendarAction } from './yukari';
import { Router } from 'express';

const router = Router({mergeParams: true});

/* GET calendar */
router.get('/', exportCalendarAction);

export default router;
