import client from '../client';


export const getHelp = (chatId) => {
  client
    .sendMessage(
      chatId,
      `Hi, I'm a tournamenator!
      I support following commands:
      1. /create - create new tournament
      2. /help - view help
      3. /join - join the tournament
      4. /leave -leave the tournament
      5. /remove @some-user @another-user - remove users from the tournament
      6. /start - start the tournament
      7. /finish - finish the tournament
      8. /result @some-user N:N @another-user - add the result of the game
      9. /show-results - view the list of registered results`
    ).promise();
};
