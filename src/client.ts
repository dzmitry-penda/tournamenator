import TelegramBotClient from 'telegram-bot-client';
export const client = new TelegramBotClient(process.env.TELEGRAM_API_TOKEN);
