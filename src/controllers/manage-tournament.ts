import client from '../client';
import { Chat } from '../models/chat.model';
import { CreateTournamentState } from '../enums/create-tournament-state';
import { TournamentType } from '../enums/tournament-type';
import TournamentSchema from '../schemas/tournament.schema';
import { TournamentState } from '../enums/tournament-state';


async function addToTournament(chatId, tournament, userInfo) {
  if (tournament.users.find(user => user.id === userInfo.id)) {
    return client.sendMessage(
      chatId,
      `User ${userInfo.first_name || userInfo.username} is already added to the tournament`
    ).promise();
  } else {
    tournament.users.push({
      id: userInfo.id,
      username: userInfo.username,
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
    });
    await tournament.save();

    return client.sendMessage(
      chatId,
      `Added ${userInfo.first_name || userInfo.username} to the tournament`
    ).promise();
  }
}

async function removeUser(chatId, tournament, userInfo) {
  if (tournament.users.find(user => user.id === userInfo.id)) {
    tournament.users = tournament.users.filter(user => user.id !== userInfo.id);
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

async function removeUsers(chatId, tournament, users) {
  return Promise.all(users.map((user) => removeUser(chatId, tournament, user)));
}

export const removeUserFromTournament = async(chatId, message) => {
  const tournament = await TournamentSchema.findOne({ chatId, state: TournamentState.New }) as any;

  if (tournament) {
    console.log(tournament);
    const textMentions = message.entities
      .filter((entity) => entity.type = 'text_mention')
      .map(m => m.user);

    const mentions = message.entities
      .filter((entity) => entity.type = 'mention')
      .map(m => message.text.substr(m.offset + 1, m.length - 1))
      .map(username => tournament.users.find(user => user.username === username))
      .filter(_ => _);

    const usersToRemove = [...textMentions, ...mentions];

    return removeUsers(chatId, tournament, usersToRemove);
  }
};

export const removeCurrentUserFromTournament = async(chatId, message) => {
  const tournament = await TournamentSchema.findOne({ chatId, state: TournamentState.New }) as any;

  if (tournament) {
    return removeUser(chatId, tournament, message.from);
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

