import client from '../client';


export const getHelp = (chatId) => {
  client
    .sendMessage(
      chatId,
      `Hi, I'm a tournamenator!
      I support following commands:
      1. /create - create new tournament
      2. /help - view help`)
    .promise();
};
