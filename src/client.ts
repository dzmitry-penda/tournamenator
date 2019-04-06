import * as TelegramBotClient from 'telegram-bot-client';
const client = new TelegramBotClient(process.env.TELEGRAM_API_TOKEN);
console.log(client)
client.on('inline.query', function(message)
{
	// Received inline query
    console.log('iq',message);
});

client.on('inline.result', function(message)
{
	// Received chosen inline result
    console.log('ir',message);
});

client.on('inline.callback.query', function(message)
{
	// New incoming callback query
    console.log('icq',message);
});



export default client;
