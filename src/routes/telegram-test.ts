import { Router } from 'express';

import { getHelp, createTournament } from '../controllers/telegram-test';

const router = Router();

router
  .post('/', (req, res, next) => {
    const text: string = req.body.text;
    const chatId = req.body.message.chat.id;
    if (text.startsWith('/help')){
      getHelp(chatId);
    }

    if (text.startsWith('/create')){
      createTournament(chatId);
    }
    res.json({ ok: true });
});

export default router;
