import { Router } from 'express';

import testRouter from './test';
import telegramRouter from './telegram-test';

const router = Router();

router.use('/test', testRouter);
router.use(`/${process.env.WEBHOOK_TOKEN}`, telegramRouter);

export default router;
