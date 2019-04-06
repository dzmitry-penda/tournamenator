import client from '../client';
import { Chat } from '../models/chat.model';
import { CreateTournamentState } from '../enums/create-tournament-state';
import { TournamentType } from '../enums/tournament-type';


const activeChats = new Map<Number, Chat>();

const sendTypeRequest = async (chatId: number, data: string) => {
  const chat = activeChats.get(chatId);
  chat.name = data;
  activeChats.set(chatId, chat);

  const message = await client.sendMessage(
    chatId,
    'OK! Now select type',
    {
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true,
        one_time_keyboard: true,
        keyboard: [
          [{ text: TournamentType[TournamentType.League] }],
          [{ text: TournamentType[TournamentType.Cup] }],
        ]
      })
    }
  ).promise();

  chat.lastMessageId = message.result.message_id;
  chat.state = CreateTournamentState.SelectingType;
  activeChats.set(chatId, chat);
}

const sendRatingRequest = async (chatId: number, data: string) => {
  const chat = activeChats.get(chatId);
  chat.type = TournamentType[data];
  activeChats.set(chatId, chat);

  const message = await client.sendMessage(
    chatId,
    'Almost done! Now type in existing rating board id or type "new" to create a new one',
    {
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true
      })
    }
  ).promise();

  chat.lastMessageId = message.result.message_id;
  chat.state = CreateTournamentState.SelectingRatingMode;
  activeChats.set(chatId, chat);
}

const finishCreation = async (chatId: number, data: string) => {
  return client.sendMessage(chatId, 'Great! Tournament created!').promise();
}

const actions = {
  [CreateTournamentState.SelectingName]: sendTypeRequest,
  [CreateTournamentState.SelectingType]: sendRatingRequest,
  [CreateTournamentState.SelectingRatingMode]: finishCreation
}

export const createTournament = async (chatId) => {
  const message = await client.sendMessage(
    chatId,
    'Great! New tournament! That\'s what I do best! How do we name it?',
    {
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true
      })
    }
  ).promise();

  activeChats.set(chatId, new Chat(message.result.message_id, CreateTournamentState.SelectingName));
};

export const continueCreatingTournament = async (chatId, reply, text) => {
  let chat = activeChats.get(chatId);
  if (chat
    && chat.lastMessageId === reply.message_id
    && reply.from.id === +process.env.TELEGRAM_API_TOKEN.split(':')[0]) {
    const message = await actions[chat.state](chatId, text);
  }
};

