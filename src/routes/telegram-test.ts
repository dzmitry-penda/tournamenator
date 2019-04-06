import { Router } from 'express';
import { getHelp } from '../controllers/bot-api';
import { createTournament, continueTournament } from '../controllers/create-tournament';


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

    if(req.body.message.reply_to_message) {
      continueTournament(chatId, req.body.message.reply_to_message);
    }

    res.json({ ok: true });
});

export default router;
