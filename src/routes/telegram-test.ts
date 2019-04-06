import { Router } from 'express';

import { getHelp, createTournament } from '../controllers/telegram-test';

const router = Router();

router
  .post('/', (req, res, next) => {
    console.log(req.body)
    const chatId = req.body.message.chat.id;
    console.log(req.body.message)
    const text: string = req.body.message.text;
    if (text.startsWith('/help')){
      getHelp(chatId);
    }

    if (text.startsWith('/create')){
      createTournament(chatId);
    }
    res.json({ ok: true });
});

export default router;
