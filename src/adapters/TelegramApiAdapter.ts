import TelegramBot = require('node-telegram-bot-api');
import { Message, Messenger, Sheet, Reaction, BotSpeechApi } from '../interfaces';

export interface IBotApiAdapter {
    onText: (trigger: RegExp, reaction: Reaction) => void;
}

export default class TelegramApiAdapter implements IBotApiAdapter {
    private api: TelegramBot;

    constructor(secret: string) {
        this.api = new TelegramBot(secret, { polling: true });
    }

    public onText(trigger: RegExp, reaction: Reaction) {
        this.api.onText(trigger, (rawMessage: TelegramBot.Message) => {
            const speechApi = this.makeSpeechApi(rawMessage);
            const message: Message = {
                messenger: Messenger.Telegram,
                text: rawMessage.text,
                userId: rawMessage.from.id.toString(),
            };
            reaction(speechApi, message);
        });
    }

    private makeSpeechApi(msg: TelegramBot.Message): BotSpeechApi {
        return {
            sendMessage(text: string) {
                this.api.sendMessage(msg.chat.id, text);
            },
            sendSheet(sheet: Sheet) {
                // this.api.sendMessage(msg.chat.id, sheetToMsg(sheet));
            },
            sendFile(file: Buffer) {
                // this.api.sendDocument(msg.chat.id, doc);
            },
        };
    }
}
