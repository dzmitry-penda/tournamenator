import { Router } from 'express';
import { getHelp } from '../controllers/bot-api';
import { createTournament, continueTournament } from '../controllers/create-tournament';


const router = Router();

router
  .post('/', (req, res, next) => {
    if (!req.body.message) {
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
    console.log('reply',req.body.message.reply_to_message)
    if(req.body.message.reply_to_message) {
      continueTournament(chatId, req.body.message.reply_to_message, text);
    }

    res.json({ ok: true });
});

export default router;
