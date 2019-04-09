import { Router } from 'express';

import { TelegramRouter } from '../utils/telegram-router';

import { getHelp } from '../controllers/bot-api';
import { createTournament, continueCreatingTournament } from '../controllers/create-tournament';
import {
  addCurrentUserToTournament,
  startTournament,
  finishTournament,
  removeCurrentUserFromTournament,
  removeUserFromTournament,
  displayResults
} from '../controllers/manage-tournament';
import { addGame } from '../controllers/manage-games';


const router = Router();
const tgRouter = new TelegramRouter();

tgRouter
  .route('/help', getHelp)
  .route('/create', createTournament)

  .route('/join', addCurrentUserToTournament)
  .route('/leave', removeCurrentUserFromTournament)
  .route('/remove', removeUserFromTournament)

  .route('/result', addGame)
  .route('/show-results', displayResults)

  .route('/start', startTournament)
  .route('/finish', finishTournament);

router
  .post('/', (req, res, next) => {
    const { message } = req.body;
    if (message) {
      console.log('message', message);
      tgRouter.match(message.text, message);

      if (message.reply_to_message) {
        continueCreatingTournament(
          message.text,
          message
        );
      }
    }

    console.log('body', req.body);

    res.json({ ok: true });
});

export default router;
