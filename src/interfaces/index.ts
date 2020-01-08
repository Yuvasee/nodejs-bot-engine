interface BotConfig {
    telegramBotToken: string;
}

// when message received new BotApi instance created with binding to proper channel API
interface BotApi {
    sendMessage: (message: Message) => void;
    sendSheet: (sheet: Sheet) => void;
    sendFile: (file: Buffer) => void;
}

interface Message {
    text: string;
    user: User;
}

interface Sheet {
    columns: string[];
    rows: string[][];
}

interface User {
    telegramId: number;
}

interface Command {
    name: string;
    triggers: RegExp[];
    reaction: (bot: BotApi, msg: Message) => void;
}

interface Feature {
    name: string;
    commands: Record<string, Command>;
    fallback: Command;
}
