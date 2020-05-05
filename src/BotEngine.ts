import { IBotEngine, IBotApiAdapter, BotSpeechApi, Command, Feature, Messenger } from './interfaces';
import * as re from './re';
import TelegramApiAdapter from './adapters/TelegramApiAdapter';

const ADAPTER_MAP: Record<Messenger, any> = {
    [Messenger.Telegram]: TelegramApiAdapter,
}

export default class BotEngine implements IBotEngine {
    private commandsRegistry = new Set<string>([]);
    private apiAdapter: IBotApiAdapter;

    constructor(messenger: Messenger, secret: string) {
        this.apiAdapter = new ADAPTER_MAP[messenger](secret);
    }

    public registerCommand(command: Command) {
        const validationError = this.validateCommand(command);
        if (validationError) {
            throw new Error(validationError);
        }

        const { triggers, reaction, name } = command;
        triggers.forEach((trigger) => this.apiAdapter.onText(trigger, reaction));
        this.commandsRegistry.add(name);
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

        this.commandsRegistry.add(name);
        console.log(`Command set: ${name} ---`);

        commandNames.forEach((commandName) => {
            commands[commandName].triggers = commands[commandName].triggers || [];
            commands[commandName].triggers.push(re.featureCommand(name, commandName));
            this.registerCommand(commands[commandName]);
        });

        fallback.triggers = fallback.triggers || [];
        fallback.triggers.push(re.featureFallback(name, commandNames));
        this.registerCommand(fallback);

        console.log(`---`);

        return this;
    }

    public registerFallback() {
        const commandNames = [...this.commandsRegistry];

        const triggers = [re.globalFallback(commandNames)];
        const reaction = (bot: BotSpeechApi) => {
            bot.sendMessage(`commands:\n${commandNames.join('\n')}`);
        };

        this.registerCommand({ name: 'global fallback', triggers, reaction });
    }

    private validateCommand(command: Command): string | undefined {
        if (this.commandsRegistry.has(command.name)) {
            return `Command names collision occured: ${command.name}. Commands should have unique names.`;
        }

        if (!command.triggers?.length) {
            return `Command ${command.name} has no triggers`;
        }

        if (command.triggers.map((t) => t instanceof RegExp).includes(false)) {
            return `Command ${command.name} triggers array contains invalid element`;
        }
    }

    private validateFeature(feature: Feature): string | undefined {
        if (this.commandsRegistry.has(feature.name)) {
            return `Command names collision occured: ${name}. Commands should have unique names.`;
        }

        if (!Object.keys(feature.commands).length) {
            return `Feature ${feature.name} has no commands`;
        }
    }
}
