import { Router } from 'express';

import { getTest, postTest } from '../controllers/telegram-test';

const router = Router();

router.get('/', getTest)
      .post('/', postTest);

export default router;
