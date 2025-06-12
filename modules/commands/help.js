const config = require('../../config/config.json');

module.exports = {
    name: "help",
    version: "1.0.0",
    author: "Hridoy",
    description: "Shows the list of commands or details of a specific command.",
    adminOnly: false,
    commandCategory: "utility",
    guide: "Use {pn}help to see all commands, or {pn}help <cmd> for details.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args, commandHandler }) {
        if (!event || !event.threadID || !event.messageID) {
            console.error("Invalid event object in help command");
            return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, event.threadID);
        }

        const commands = commandHandler.commands;
        const prefix = config.bot.prefix;

        if (args.length > 0) {
            const cmdName = args[0].toLowerCase();
            const command = commands.get(cmdName);
            if (!command) {
                return api.sendMessage(`${config.bot.botName}: ⚠️ Command "${cmdName}" not found.`, event.threadID);
            }

            const details = [
                `「 COMMAND DETAILS 」`,
                `│ Name: ${command.name}`,
                `│ Version: ${command.version}`,
                `│ Author: ${command.author}`,
                `│ Category: ${command.commandCategory.toUpperCase()}`,
                `│ Description: ${command.description}`,
                `│ Guide: ${command.guide.replace(/{pn}/g, prefix)}`,
                `│ Cooldown: ${command.cooldowns} seconds`,
                `│ Admin Only: ${command.adminOnly ? "Yes" : "No"}`,
                `╰──────────────────╯`
            ].join('\n');
            return api.sendMessage(details, event.threadID);
        }

        const categories = {};
        commands.forEach(command => {
            const category = command.commandCategory.toUpperCase();
            if (!categories[category]) categories[category] = [];
            categories[category].push(command.name);
        });

        const categoryLines = Object.entries(categories).map(([category, cmds]) => {
            return [
                `✦  ${category}`,
                `  ╰┈ ${cmds.join(', ')}`,
                ``
            ].join('\n');
        }).join('\n');

        const totalCommands = commands.size;
        const helpMessage = [
            `╭┈「 COMMAND LIST 」┈╮`,
            `│ Your personal Messenger assistant 💻`,
            `│ Built for speed. Packed with swag.`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            categoryLines,
            `━━━━━━━━━━━━━━━━━━━━`,
            `│ Total Commands: ${totalCommands}`,
            `│ Type ${prefix}help <cmd> for details`,
            `│ Owner: ${config.bot.ownerName}`,
            `╰──────────────────╯`
        ].join('\n');

        api.sendMessage(helpMessage, event.threadID);
    }
};
