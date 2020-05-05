/**
 * Matches "feature command [anything...]"
 * Used to match particular feature command
 * @param {string} feature
 * @param {string} command
 */
export function featureCommand(feature: string, command: string): RegExp {
    return new RegExp(`^${feature}[ \\t]+${command}([ \\t]+.*)?$`);
}

/**
 * Matches "feature" and "feature [anything but (one|of|commands)]"
 * Used to match improper feature use and show fallback
 * @param {string} feature
 * @param {string[]} commands
 */
export function featureFallback(feature: string, commands: string[]): RegExp {
    return new RegExp(`^${feature}(?!\\S|([ \\t]+)?(${commands.join('|')}))`);
}

/**
 * Matches everything but valid commands
 * @param {string[]} commands
 */
export function globalFallback(commands: string[]): RegExp {
    const reMinusSum = '-\\d+(?:[.,]\\d+)?(?:[+\\-*\\/]\\d+(?:[.,]\\d+)?)*';
    const joinedCommands = commands.join('|');
    return new RegExp(`^(?!(${reMinusSum}|${joinedCommands})).+|^(${joinedCommands})\\w+.*`);
}
