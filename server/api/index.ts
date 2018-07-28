import { Router } from 'express';
import { fetchAction } from './haruka';
import users from './users'

const router = Router();

// setup routes
router.use(users);
//router.get('/haruka/:year/:month', fetchAction);

export default router;