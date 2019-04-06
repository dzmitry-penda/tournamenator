import client from '../client';
import { Chat } from '../models/chat.model';
import { CreateTournamentState } from '../enums/create-tournament-state';
import { TournamentType } from '../enums/tournament-type';
import TournamentSchema from '../schemas/tournament.schema';


const activeChats = new Map<Number, Chat>();

const selectName = (chatId: number, name: string) => {
  const chat = activeChats.get(chatId);
  chat.name = name;
  activeChats.set(chatId, chat);
  return name;
}

const selectType = async (chatId: number, data: string) => {
  const chat = activeChats.get(chatId);
  chat.name = TournamentType[data];
  activeChats.set(chatId, chat);
  return true;
}

const selectRating = async (chatId: number, data: string) => {
  let ratingId;

  if (data.toLowerCase() === 'new') {
    const doc: any = await TournamentSchema.findOne({}).sort('-ratingId').exec();
    console.log('DOCUMENT', doc);
    ratingId = doc && doc.ratingId || 1;
    if (ratingId) {
      client.sendMessage(
        chatId,
        `Your rating board id is ${ratingId}. Store it somethere if you want to use it some time later`,
      );
    }
  } else if(!isNaN(+data)){
    ratingId = +data;
  }

  if (ratingId == null) {
    client.sendMessage(
      chatId,
      'Something is wrong. Please type in existing rating board id or type "new" to create a new one',
      {
        reply_markup: JSON.stringify({
          force_reply: true,
          selective: true
        })
      }
    ).promise();
  } else {
    const chat = activeChats.get(chatId);
    chat.ratingId = ratingId
    activeChats.set(chatId, chat);
  }

  return ratingId != null;
}

const sendTypeRequest = async (chatId: number) => {
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

  const chat = activeChats.get(chatId);
  chat.lastMessageId = message.result.message_id;
  chat.state = CreateTournamentState.SelectingType;
  activeChats.set(chatId, chat);
}

const sendRatingRequest = async (chatId: number) => {
  return client.sendMessage(
    chatId,
    'Almost done! Now type in existing rating board id or type "new" to create a new one',
    {
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true
      })
    }
  ).promise();
}

const finishCreation = async (chatId: number) => {
  const chat = activeChats.get(chatId);
  TournamentSchema.create({
    name: chat.name,
    ratingId: chat.ratingId,
    chatId: chatId
  });

  return client.sendMessage(
    chatId,
    `Great! Tournament ${chat.name} created!`
  ).promise();
}

const actions = {
  [CreateTournamentState.SelectingType]: sendTypeRequest,
  [CreateTournamentState.SelectingRatingMode]: sendRatingRequest,
  [CreateTournamentState.Confirmation]: finishCreation,
}

const effects = {
  [CreateTournamentState.SelectingName]: selectName,
  [CreateTournamentState.SelectingType]: selectType,
  [CreateTournamentState.SelectingRatingMode]: selectRating
}

const nextStep = {
  [CreateTournamentState.SelectingName]: CreateTournamentState.SelectingRatingMode,
  [CreateTournamentState.SelectingRatingMode]: CreateTournamentState.Confirmation,
  // extended mode :)
  // [CreateTournamentState.SelectingName]: CreateTournamentState.SelectingType,
  // [CreateTournamentState.SelectingType]: CreateTournamentState.SelectingRatingMode
  // [CreateTournamentState.SelectingRatingMode]: CreateTournamentState.Confirmation,
}

export const createTournament = async (chatId, message) => {
  const reply = await client.sendMessage(
    chatId,
    'Great! New tournament! That\'s what I do best! How do we name it?',
    {
      reply_to_message_id: message.message_id,
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true
      })
    }
  ).promise();

  activeChats.set(chatId, new Chat(reply.result.message_id, CreateTournamentState.SelectingName));
};

export const continueCreatingTournament = async (text, message) => {
  const chatId = message.chat.id;
  const replyTarget = message.reply_to_message;
  let chat = activeChats.get(chatId);

  if (chat && chat.lastMessageId === replyTarget.message_id
    && replyTarget.from.id === +process.env.TELEGRAM_API_TOKEN.split(':')[0]) {

    const isValid = await effects[chat.state](chatId, text);
    if (!isValid) return;

    const nextAction = nextStep[chat.state];
    const reply = await actions[nextAction](chatId);

    chat = activeChats.get(chatId);
    chat.lastMessageId = reply.result.message_id;
    chat.state = nextAction;
    activeChats.set(chatId, chat);
  }
};

