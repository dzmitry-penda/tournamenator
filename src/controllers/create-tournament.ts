import client from '../client';
import { Chat } from '../models/chat.model';
import { CreateTournamentState } from '../enums/create-tournament-state';
import { TournamentType } from '../enums/tournament-type';
import TournamentSchema from '../schemas/tournament.schema';
import { TournamentState } from '../enums/tournament-state';


const activeChats = new Map<Number, Chat>();

const checkUserResponse = async(chatId: number, response: string) => {
  const chat = activeChats.get(chatId);
  if (response.toLowerCase().trim() === 'yes') {
    const tournamentToClose = await TournamentSchema.findByIdAndUpdate(
      chat.tournamentIdToClose,
      {
        state: TournamentState.Closed
      }
    );
    client.sendMessage(chatId, `Tournament closed. Now let's create a new one!`);

    return true;
  }

  activeChats.delete(chatId);
  client.sendMessage(chatId, `OK. Keeping as is`);

  return false;
};

const selectName = (chatId: number, name: string) => {
  const chat = activeChats.get(chatId);
  chat.name = name;
  activeChats.set(chatId, chat);

  return name;
};

const selectType = async(chatId: number, data: string) => {
  const chat = activeChats.get(chatId);
  chat.name = TournamentType[data];
  activeChats.set(chatId, chat);

  return true;
};

const selectRating = async(chatId: number, data: string, message) => {
  let ratingId;
  if (data.toLowerCase() === 'new') {
    const doc: any = await TournamentSchema.findOne({}).sort('-ratingId').exec();
    ratingId = doc && doc.ratingId || 1;
    if (ratingId) {
      client.sendMessage(
        chatId,
        `Your rating board id is ${ratingId}. Store it somewhere if you want to use it at any time later`,
      );
    }
  } else if (!isNaN(+data)) {
    ratingId = +data;
  }

  const chat = activeChats.get(chatId);

  if (ratingId == null) {
    const reply = await client.sendMessage(
      chatId,
      'Something is wrong. Please type in existing rating board id or type "new" to create a new one',
      {
        reply_to_message_id: message.message_id,
        reply_markup: JSON.stringify({
          force_reply: true,
          selective: true
        })
      }
    ).promise();
    chat.lastMessageId = reply.result.message_id;
  } else {
    chat.ratingId = ratingId;
  }
  activeChats.set(chatId, chat);

  return ratingId != null;
};

const sendNameRequest = async(chatId: number, message) => {
  return client.sendMessage(
    chatId,
    'How do we name it? How about "My super cool tournament?"',
    {
      reply_to_message_id: message.message_id,
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true
      })
    }
  ).promise();
};

const sendTypeRequest = async(chatId: number, message) => {
  return client.sendMessage(
    chatId,
    'OK! Now select type',
    {
      reply_to_message_id: message.message_id,
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
};

const sendRatingRequest = async(chatId: number, message) => {
  return client.sendMessage(
    chatId,
    'Almost done! Now type in existing rating board id or type "new" to create a new one',
    {
      reply_to_message_id: message.message_id,
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true
      })
    }
  ).promise();
};

const finishCreation = async(chatId: number) => {
  const chat = activeChats.get(chatId);
  TournamentSchema.create({
    name: chat.name,
    ratingId: chat.ratingId,
    chatId: chatId
  });

  activeChats.delete(chatId);

  return client.sendMessage(
    chatId,
    `Great! Tournament ${chat.name} was created! Players can now be added using /join and /add commands`
  ).promise();
};

const actions = {
  [CreateTournamentState.SelectingName]: sendNameRequest,
  [CreateTournamentState.SelectingType]: sendTypeRequest,
  [CreateTournamentState.SelectingRatingMode]: sendRatingRequest,
  [CreateTournamentState.Confirmation]: finishCreation,
};

const effects = {
  [CreateTournamentState.RecreatingTournament]: checkUserResponse,
  [CreateTournamentState.SelectingName]: selectName,
  [CreateTournamentState.SelectingType]: selectType,
  [CreateTournamentState.SelectingRatingMode]: selectRating
};

const nextStep = {
  [CreateTournamentState.RecreatingTournament]: CreateTournamentState.SelectingName,
  [CreateTournamentState.SelectingName]: CreateTournamentState.SelectingRatingMode,
  [CreateTournamentState.SelectingRatingMode]: CreateTournamentState.Confirmation,
  // extended mode :)
  // [CreateTournamentState.SelectingName]: CreateTournamentState.SelectingType,
  // [CreateTournamentState.SelectingType]: CreateTournamentState.SelectingRatingMode
  // [CreateTournamentState.SelectingRatingMode]: CreateTournamentState.Confirmation,
};

export const createTournament = async(chatId, message) => {
  const tournaments = await TournamentSchema.find({ chatId }) as any[];
  const activeTournament = tournaments &&
    tournaments.find(t => t.state === TournamentState.New || t.state === TournamentState.Started);
  if (activeTournament) {
    const reply = await client.sendMessage(
      chatId,
      // tslint:disable-next-line:max-line-length
      `You have active tournament ${activeTournament.name} in this chat. Do you want to close it and create new? Type "yes" to create new and close opened one`,
      {
        reply_to_message_id: message.message_id,
        reply_markup: JSON.stringify({
          force_reply: true,
          selective: true
        })
      }
    ).promise();
    activeChats.set(
      chatId,
      new Chat(reply.result.message_id, CreateTournamentState.RecreatingTournament, activeTournament._id)
    );
  } else {
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
  }
};

export const continueCreatingTournament = async(text, message) => {
  const chatId = message.chat.id;
  const replyTarget = message.reply_to_message;
  let chat = activeChats.get(chatId);

  if (chat && chat.lastMessageId === replyTarget.message_id
    && replyTarget.from.id === +process.env.TELEGRAM_API_TOKEN.split(':')[0]) {

    const isValid = await effects[chat.state](chatId, text, message);

    if (!isValid) {
      return;
    }

    const nextAction = nextStep[chat.state];
    const reply = await actions[nextAction](chatId, message);

    chat = activeChats.get(chatId);
    chat.lastMessageId = reply.result.message_id;
    chat.state = nextAction;
    activeChats.set(chatId, chat);
  }
};

