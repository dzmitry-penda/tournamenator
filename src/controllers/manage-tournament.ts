import client from '../client';
import { Chat } from '../models/chat.model';
import { CreateTournamentState } from '../enums/create-tournament-state';
import { TournamentType } from '../enums/tournament-type';
import TournamentSchema from '../schemas/tournament.schema';
import { TournamentState } from '../enums/tournament-state';


async function addToTournament(chatId, tournament, userInfo) {
  if (tournament.users.find(user => user === userInfo.id)) {
    return client.sendMessage(
      chatId,
      `User ${userInfo.first_name || userInfo.username} is already added to the tournament`
    ).promise();
  } else {
    tournament.users.push(userInfo.id);
    await tournament.save();

    return client.sendMessage(
      chatId,
      `Added ${userInfo.first_name || userInfo.username} to the tournament`
    ).promise();
  }
}

async function removeFromTournament(chatId, tournament, userInfo) {
  if (tournament.users.find(user => user === userInfo.id)) {
    tournament.users = tournament.users.filter(id => id !== userInfo.id);
    await tournament.save();

    return client.sendMessage(
      chatId,
      `Removed ${userInfo.first_name || userInfo.username} from the tournament`
    ).promise();
  } else {
    return client.sendMessage(
      chatId,
      `User ${userInfo.first_name || userInfo.username} was not added to the tournament`
    ).promise();
  }
}

export const removeUserFromTournament = async(chatId, message) => {
  const tournament = await TournamentSchema.findOne({ chatId, state: TournamentState.New }) as any;

  if (tournament) {
    console.log(tournament);
    const mention = message.entities.find((entity) => entity.type = 'text_mention');

    console.log(mention, mention.user);
    if (mention && mention.user) {
     return removeFromTournament(chatId, tournament, mention.user);
    }
  }
};

export const removeCurrentUserFromTournament = async(chatId, message) => {
  const tournament = await TournamentSchema.findOne({ chatId, state: TournamentState.New }) as any;

  if (tournament) {
    return removeFromTournament(chatId, tournament, message.from);
  }
};

export const addUserToTournament = async(chatId, message) => {
  const tournament = await TournamentSchema.findOne({ chatId, state: TournamentState.New }) as any;

  if (tournament) {
    console.log(tournament);
    const mention = message.entities.find((entity) => entity.type = 'text_mention');

    console.log(mention, mention.user);
    if (mention && mention.user) {
     return addToTournament(chatId, tournament, mention.user);
    }
  }
};

export const addCurrentUserToTournament = async(chatId, message) => {
  const tournament = await TournamentSchema.findOne({ chatId, state: TournamentState.New }) as any;

  if (tournament) {
    return addToTournament(chatId, tournament, message.from);
  }
};

export const startTournament = async(chatId, message) => {
  const tournament = await TournamentSchema.findOneAndUpdate(
    { chatId, state: TournamentState.New },
    { state: TournamentState.Started }
  ) as any;

  return client.sendMessage(
    chatId,
    `Yes! Tournament ${tournament.name} has started!`
  ).promise();
};

