import * as TelegramBotClient from 'telegram-bot-client';
const client = new TelegramBotClient(process.env.TELEGRAM_API_TOKEN);


client.on('inline.callback.query', (msg) => {

  var data = msg; //Value from 'callback_data' field of clicked button

  console.log(data);

  //do stuff
});


export default client;
