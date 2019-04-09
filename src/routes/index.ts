import { Router } from 'express';

import testRouter from './test';
import telegramRouter from './telegram-api';

const router = Router();
console.log(`/${process.env.WEBHOOK_TOKEN}`);
router.use('/test', testRouter);
router.use(`/${process.env.WEBHOOK_TOKEN}`, telegramRouter);

export default router;
