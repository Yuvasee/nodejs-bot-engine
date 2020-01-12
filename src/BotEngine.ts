import TelegramBot = require('node-telegram-bot-api');
import { BotConfig, BotApi, Message, Sheet, Command, Feature, Channel } from './interfaces';
import * as re from './re';

export interface IBotEngine {
    registerCommand: (command: Command) => void;
    registerFeature: (feature: Feature) => void;
    registerFallback: () => void;
}

export default class BotEngine implements IBotEngine {
    private registeredCommands = new Set<string>([]);
    private api: TelegramBot;
    private botApi: BotApi;

    constructor(config: BotConfig) {
        this.api = new TelegramBot(config.telegramBotToken, { polling: true });
    }

    public registerCommand(command: Command) {
        const validationResult = this.validateCommand(command);
        if (validationResult) {
            throw new Error(validationResult);
        }

        const { triggers, reaction, name } = command;

        triggers.forEach(trigger =>
            this.api.onText(trigger, (msg: TelegramBot.Message) => {
                const botApi = this.createApiTelegram(msg);
                const message: Message = {
                    channel: Channel.Telegram,
                    text: msg.text,
                    userId: msg.from.id.toString(),
                };
                reaction(botApi, message);
            }),
        );

        this.registeredCommands.add(name);
        console.log('Registered command: ' + name);

        return this;
    }

    public registerFeature(feature: Feature) {
        const validationResult = this.validateFeature(feature);
        if (validationResult) {
            throw new Error(validationResult);
        }

        const { name, commands, fallback } = feature;
        const commandNames = Object.keys(commands);

        this.registeredCommands.add(name);
        console.log(`Command set: ${name} ---`);

        commandNames.forEach(commandName => {
            commands[commandName].triggers.push(re.featureCommand(name, commandName));
            this.registerCommand(commands[commandName]);
        });

        fallback.triggers.push(re.featureFallback(name, commandNames));
        this.registerCommand(fallback);

        console.log(`---`);

        return this;
    }

    public registerFallback() {
        const commandNames = [...this.registeredCommands];

        const triggers = [re.globalFallback(commandNames)];
        const reaction = (bot: BotApi) => {
            bot.sendMessage(`commands:\n${commandNames.join('\n')}`);
        };

        this.registerCommand({ name: 'global fallback', triggers, reaction });
    }

    private validateCommand(command: Command): string | undefined {
        if (this.registeredCommands.has(command.name)) {
            return `Command names collision occured: ${command.name}. Commands should have unique names.`;
        }

        if (!command.triggers?.length) {
            return `Command ${command.name} has no triggers`;
        }

        if (command.triggers.map(t => t instanceof RegExp).includes(false)) {
            return `Command ${command.name} triggers array contains invalid element`;
        }
    }

    private validateFeature(feature: Feature): string | undefined {
        if (this.registeredCommands.has(feature.name)) {
            return `Command names collision occured: ${name}. Commands should have unique names.`;
        }

        if (!feature.commands?.length) {
            return `Feature ${feature.name} has no commands`;
        }
    }

    // TODO: extract to BotApi class with constructor overloading
    private createApiTelegram(msg: TelegramBot.Message): BotApi {
        return {
            sendMessage: (text: string) => {
                this.api.sendMessage(msg.chat.id, text);
            },
            sendSheet: (sheet: Sheet) => {
                // this.api.sendMessage(msg.chat.id, sheetToMsg(sheet));
            },
            sendFile: (file: Buffer) => {
                // this.api.sendDocument(msg.chat.id, doc);
            },
        };
    }
}
