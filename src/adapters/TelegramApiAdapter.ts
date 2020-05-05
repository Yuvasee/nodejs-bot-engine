import TelegramBot = require('node-telegram-bot-api');
import { IBotApiAdapter, BotSpeechApi, CommonMessage, Messenger, SheetData, Reaction } from '../interfaces';
import { ParseMode } from 'node-telegram-bot-api';

export default class TelegramApiAdapter implements IBotApiAdapter {
    private api: TelegramBot;

    constructor(secret: string) {
        this.api = new TelegramBot(secret, { polling: true });
    }

    public onText(this: TelegramApiAdapter, trigger: RegExp, reaction: Reaction) {
        this.api.onText(trigger, (rawMessage: TelegramBot.Message) => {
            const speechApi = this.makeSpeechApi(rawMessage);
            const message = this.makeCommonMessage(rawMessage);
            reaction(speechApi, message);
        });
    }

    private makeSpeechApi(this: TelegramApiAdapter, msg: TelegramBot.Message): BotSpeechApi {
        const telegramApi = this.api;
        return {
            sendMessage(text: string) {
                telegramApi.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' as ParseMode });
            },
            sendFile(file: Buffer, fileName: string, contentType: string) {
                telegramApi.sendDocument(msg.chat.id, file, {}, { filename: fileName, contentType });
            },
        };
    }

    private makeCommonMessage(rawMessage: TelegramBot.Message) {
        return {
            messenger: Messenger.Telegram,
            text: rawMessage.text,
            userId: rawMessage.from.id.toString(),
        } as CommonMessage;
    }
}
