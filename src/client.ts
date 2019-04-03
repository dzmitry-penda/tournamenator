import * as TelegramBotClient from 'telegram-bot-client';
const client = new TelegramBotClient(process.env.TELEGRAM_API_TOKEN);

export default client;
