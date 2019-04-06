import client from '../client';
import { Chat } from '../models/chat.model';
import { CreateTournamentState } from '../enums/create-tournament-state';
import { TournamentType } from '../enums/tournament-type';


const activeChats = new Map<Number, Chat>();

const sendTypeRequest = async (chatId, data) => {
  console.log('setting data')
  const chat = activeChats.get(chatId);
  chat.name = data;
  activeChats.set(chatId, chat);
  console.log(' data set', activeChats.get(chatId))
  console.log(' data set', activeChats.get(chatId))

  return client.sendMessage(
    chatId,
    'OK! Now select type',
    {
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true,
        inline_keyboard: [
          { text: TournamentType[TournamentType.League], callback_data: TournamentType.League },
          { text: TournamentType[TournamentType.Cup], callback_data: TournamentType.Cup },
        ]
      })
    }
  ).promise();
}

const sendRatingRequest = async (chatId, data) => {
  const chat = activeChats.get(chatId);
  chat.type = data;
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

const finishCreation = async (chatId, reply) => {
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

  activeChats.set(chatId, new Chat(message.result.message_id, CreateTournamentState.SelectingName));
};



export const continueTournament = async (chatId, reply, text) => {
  let chat = activeChats.get(chatId);
  console.log('chat',chat)
  console.log('inside',reply)
  console.log('mid',chat.lastMessageId, reply.message_id, reply.from.id, process.env.TELEGRAM_API_TOKEN.split(':')[0])
  if (chat
    && chat.lastMessageId === reply.message_id
    && reply.from.id === process.env.TELEGRAM_API_TOKEN.split(':')[0]) {
    console.log('before', chat.state, text)

    const message = await actions[chat.state](chatId, text);
    console.log('after', activeChats.get(chatId))

    chat = activeChats.get(chatId);
    chat.lastMessageId = reply.result.message_id;
    activeChats.set(chatId, chat);

    console.log(chat);
  }
};

