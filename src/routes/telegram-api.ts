import { Router } from 'express';

import { TelegramRouter } from '../utils/telegram-router';

import { getHelp } from '../controllers/bot-api';
import { createTournament, continueCreatingTournament } from '../controllers/create-tournament';
import { addUserToTournament, addCurrentUserToTournament, startTournament } from '../controllers/manage-tournament';


const router = Router();
const tgRouter = new TelegramRouter();

tgRouter
  .route('/help', getHelp)
  .route('/create', createTournament)
  .route('/join', addCurrentUserToTournament)
  .route('/add', addUserToTournament)
  .route('/start', startTournament);

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
