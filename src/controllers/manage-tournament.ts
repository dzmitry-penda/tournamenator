import client from '../client';
import TournamentSchema from '../schemas/tournament.schema';
import { TournamentState } from '../enums/tournament-state';
import GameSchema from '../schemas/game.schema';


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
    const users = tournament.users.filter(user => user.id !== userInfo.id);
    await TournamentSchema.findByIdAndUpdate(tournament.id, { users });

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
  if (!users.length) {
    return client.sendMessage(
      chatId,
      `No listed users can be removed`
    ).promise();
  }

  return Promise.all(users.map(async(user) => await removeUser(chatId, tournament, user)));
}

export function showNoActiveTournamentError(chatId) {
  return client.sendMessage(
    chatId,
    `Hmm... there is no active tournament. Refer to /help to get more info about the available commands`
  ).promise();
}

function formatGame(tournament, game) {
  const isFirstUserWinner = game.scoreUser1 > game.scoreUser2;
  const isSecondUserWinner = game.scoreUser2 > game.scoreUser1;

  const firstUser = tournament.users.find(u => u.id === game.userId1);
  const secondUser = tournament.users.find(u => u.id === game.userId2);

  let firstUserName =
    (firstUser.first_name || '') + (firstUser.last_name ? ` ${firstUser.last_name}` : '')
    || firstUser.username;
  if (isFirstUserWinner) {
    firstUserName = `*${firstUserName}*`;
  }

  let secondUserName =
    (secondUser.first_name || '') + (secondUser.last_name ? ` ${secondUser.last_name}` : '')
    || secondUser.username;
  if (isSecondUserWinner) {
    secondUserName = `*${secondUserName}*`;
  }


  return `${firstUserName} ${game.scoreUser1}:${game.scoreUser2} ${secondUserName}`;
}

export const removeUserFromTournament = async(chatId, message) => {
  const tournament = await TournamentSchema.findOne({ chatId, state: TournamentState.New }) as any;

  if (tournament) {
    const textMentions = message.entities
      .filter((entity) => entity.type === 'text_mention')
      .map(m => m.user);

    const mentions = message.entities
      .filter((entity) => entity.type === 'mention')
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
  const tournament = await TournamentSchema.findOne(
    { chatId, state: TournamentState.New },
  ) as any;

  if (!tournament) {
    return client.sendMessage(
      chatId,
      `Hmm... there is no tournaments to start. Refer to help to see the available commands`
    ).promise();
  }

  await tournament.update({ state: TournamentState.Started });

  return client.sendMessage(
    chatId,
    `Yes! Tournament ${tournament.name} has started!`
  ).promise();
};


export const finishTournament = async(chatId, message) => {
  const tournament = await TournamentSchema.findOne(
    { chatId, state: TournamentState.Started },
  ) as any;

  if (!tournament) {
    return showNoActiveTournamentError(chatId);
  }

  await tournament.update({ state: TournamentState.Finished });

  return client.sendMessage(
    chatId,
    `Tournament ${tournament.name} finished!`
  ).promise();
};

export const displayResults = async(chatId, message) => {
  const tournament = await TournamentSchema.findOne(
    { chatId, state: TournamentState.Started },
  ) as any;

  if (!tournament) {
    return showNoActiveTournamentError(chatId);
  }

  const games = await GameSchema.find({tournament: tournament._id}) as any[];

  const gamesInfo = games.map(game => formatGame(tournament, game)).join('\r\n');

  return client.sendMessage(
    chatId,
    `Games:\r\n${gamesInfo}`,
    {
      parse_mode: 'Markdown'
    }
  ).promise();
};
