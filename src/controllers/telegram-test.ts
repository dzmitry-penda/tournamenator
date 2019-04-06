import client from '../client';

export const getHelp = (chatId) => {
  client
    .sendMessage(
      chatId,
      `Hi, I'm a tournamenator!
      I support following commands:
      1. /create - create new tournament
      2. /help - view help`)
    .promise()
};

export const createTournament = (chatId) => {
  return client.sendMessage(
    chatId,
    'Great! New tournament! That\'s what I do best! How do we name it?',
    {
      reply_markup: JSON.stringify({
        force_reply: true,
        selective: true,
        one_time_keyboard: true,
        keyboard: [['Over 18'],['Under 18']]
      })
    }
  ).promise();
};
