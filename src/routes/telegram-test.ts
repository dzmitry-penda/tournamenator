import { Router } from 'express';
import { getHelp } from '../controllers/bot-api';
import { createTournament, continueCreatingTournament } from '../controllers/create-tournament';


const router = Router();

router
  .post('/', (req, res, next) => {
    if (!req.body.message) {
      res.json({ ok: true });
      return;
    }
    const chatId = req.body.message.chat.id;
    const text: string = req.body.message.text;
    console.log(req.body.message)
    if (text.startsWith('/help')){
      getHelp(chatId);
    }

    if (text.startsWith('/create')){
      createTournament(chatId);
    }

    if (req.body.message.reply_to_message) {
      continueCreatingTournament(chatId, req.body.message.reply_to_message, text);
    }

    res.json({ ok: true });
});

export default router;
