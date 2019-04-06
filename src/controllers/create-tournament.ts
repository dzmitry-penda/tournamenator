import client from '../client';
import { Chat } from '../models/chat.model';
import { CreateTournamentState } from '../enums/create-tournament-state';
import { TournamentType } from '../enums/tournament-type';


const activeChats = new Map<Number, Chat>();

const sendTypeRequest = async (chatId, reply) => {
  const chat = activeChats.get(chatId);
  chat.name = reply.text;
  activeChats.set(chatId, chat);

  return client.sendMessage(
    chatId,
    'OK! Now select type',
    {
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true,
        one_time_keyboard: true,
        inline_keyboard: [
          { text: TournamentType[TournamentType.League], callback_data: TournamentType.League },
          { text: TournamentType[TournamentType.Cup], callback_data: TournamentType.Cup },
        ]
      })
    }
  ).promise();
}

const sendRatingRequest = async (chatId, reply) => {
  const chat = activeChats.get(chatId);
  chat.type = reply.callback_data;
  activeChats.set(chatId, chat);

  return client.sendMessage(
    chatId,
    'Almost done! Now type in existing rating board id or type "new" to create a new one',
    {
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true,
      })
    }
  ).promise();
}

const finishCreation = async (chatId, reply) => {7
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

  console.log(message);

  activeChats.set(chatId, new Chat(message.message_id, CreateTournamentState.SelectingName));
};



export const continueTournament = async (chatId, reply) => {
  let chat = activeChats.get(chatId);

  if (chat
    && chat.lastMessageId === reply.message_id
    && reply.from.username === process.env.TELEGRAM_API_TOKEN.split('.')[0]) {
    const message = await actions[chat.state](chatId, reply);

    chat = activeChats.get(chatId);
    chat.lastMessageId = reply.message_id;
    activeChats.set(chatId, chat);

    console.log(chat);
  }
};

