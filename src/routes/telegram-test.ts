import { Router } from 'express';
import { getHelp } from '../controllers/bot-api';
import { createTournament, continueCreatingTournament } from '../controllers/create-tournament';
import { TelegramRouter } from '../utils/telegram-router';


const router = Router();
const tgRouter = new TelegramRouter();

tgRouter
  .route('/help', getHelp)
  .route('/create', createTournament);

router
  .post('/', (req, res, next) => {
    const { message } = req.body;
    if (message) {
      console.log(message);
      tgRouter.match(message.text, message);

      if (message.reply_to_message) {
        continueCreatingTournament(
          message.text,
          message
        );
      }
    }

    console.log(req.body);

    res.json({ ok: true });
});

export default router;
