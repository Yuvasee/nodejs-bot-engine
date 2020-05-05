export interface IBotEngine {
    registerCommand: (command: Command) => void;
    registerFeature: (feature: Feature) => void;
    registerFallback: () => void;
}

export interface IBotApiAdapter {
    onText: (trigger: RegExp, reaction: Reaction) => void;
}

export interface BotConfig {
    telegramToken: string;
}

/**
 * On every message received new BotApi instance created
 * with bindings to proper channel API, chat id etc.
 */
export interface BotSpeechApi {
    sendMessage: (text: string) => void;
    sendFile: (file: Buffer, fileName: string, contentType: string) => void;
}

export enum Messenger {
    Telegram = 'Telegram',
}

export interface CommonMessage {
    messenger: Messenger;
    text: string;
    userId: string;
}

export interface SheetData {
    columns: string[];
    rows: string[][];
}

export type Reaction = (bot: BotSpeechApi, msg: CommonMessage) => void;

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
