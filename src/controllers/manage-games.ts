import client from '../client';
import { Chat } from '../models/chat.model';
import { CreateTournamentState } from '../enums/create-tournament-state';
import { TournamentType } from '../enums/tournament-type';
import TournamentSchema from '../schemas/tournament.schema';
import { TournamentState } from '../enums/tournament-state';
import gameSchema from '../schemas/game.schema';
import { showNoActiveTournamentError } from './manage-tournament';

const getUser = (tournament, mention, text) => {
  if (mention.type === 'text_mention') {
    return mention.user;
  }

  if (mention.type === 'mention') {
    return tournament.users.find(user =>
      user.username === text.substr(mention.offset + 1, mention.length - 1)
    );
  }
};

export const addGame = async(chatId, message) => {
  const tournament = await TournamentSchema.findOne(
    { chatId, state: TournamentState.Started },
  ) as any;

  if (!tournament) {
    showNoActiveTournamentError(chatId);
  }

  const mentions = message.entities
    .filter((entity) => entity.type === 'text_mention' || entity.type === 'mention');

  if (mentions.length !== 2) {
    return client.sendMessage(
      chatId,
      `Result should contain 2 mentions and a score between them. Check /help for more info`
    );
  }
  const [user1, user2] = mentions.map(m => getUser(tournament, m, message.text));
  const start = mentions[0].offset + mentions[0].length,
    finish = mentions[1].offset;
  const score = message.text.substr(start, finish - start).trim();

  if (!score) {
    return client.sendMessage(
      chatId,
      `Probably you forgot to write the scrore`
    ).promise();
  }

  const [ scoreUser1, scoreUser2 ] = score.split(':');
  tournament.update({
    games: [...tournament.games, gameSchema.create({
      scoreUser1,
      scoreUser2,
      userId1: user1.id,
      userId2: user2.id,
      tournament: tournament._id
    })]
  });

  return client.sendMessage(
    chatId,
    `Yes! Added score ${score}!`
  ).promise();
};
