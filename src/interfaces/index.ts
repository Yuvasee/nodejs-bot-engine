export interface BotConfig {
    telegramBotToken: string;
}

/**
 * On every message received new BotApi instance created
 * with bindings to proper channel API, chat id etc.
 */
export interface BotApi {
    sendMessage: (text: string) => void;
    sendSheet: (sheet: Sheet) => void;
    sendFile: (file: Buffer) => void;
}

export enum Channel {
    Telegram = 'Telegram',
}

export interface Message {
    channel: Channel;
    text: string;
    userId: string;
}

export interface Sheet {
    columns: string[];
    rows: string[][];
}

export interface Command {
    name: string;
    triggers: RegExp[];
    reaction: (bot: BotApi, msg: Message) => void;
}

export interface Feature {
    name: string;
    commands: Record<string, Command>;
    fallback: Command;
}
