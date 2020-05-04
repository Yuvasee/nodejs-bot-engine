export interface BotConfig {
    telegramToken: string;
}

/**
 * On every message received new BotApi instance created
 * with bindings to proper channel API, chat id etc.
 */
export interface BotSpeechApi {
    sendMessage: (text: string) => void;
    sendSheet: (sheet: Sheet) => void;
    sendFile: (file: Buffer) => void;
}

export enum Messenger {
    Telegram = 'Telegram',
}

export interface Message {
    messenger: Messenger;
    text: string;
    userId: string;
}

export interface Sheet {
    columns: string[];
    rows: string[][];
}

export type Reaction = (bot: BotSpeechApi, msg: Message) => void;

export interface Command {
    name: string;
    triggers?: RegExp[];
    reaction: Reaction;
}

export interface Feature {
    name: string;
    commands: Record<string, Command>;
    fallback: Command;
}
