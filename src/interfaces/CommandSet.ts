import Command from './Command';

export default interface CommandSet {
    name: string;
    commands: {
        [key: string]: Command;
    };
    fallback: Command;
}
