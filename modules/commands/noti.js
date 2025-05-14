const config = require('../../config/config.json');
const logger = require('../../includes/logger');

module.exports = {
    name: "noti",
    version: "1.0.0",
    author: "Hridoy",
    description: "Sends a notification to all group chats (admin only).",
    adminOnly: true,
    commandCategory: "admin",
    guide: "Use {pn}noti <notificationtext> to send a notification to all groups.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        if (!event || !event.threadID || !event.messageID) {
            logger.error("Invalid event object in noti command");
            return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, event.threadID);
        }

        if (args.length === 0) {
            return api.sendMessage(`${config.bot.botName}: ⚠️ Please provide a notification message. Usage: ${this.guide}`, event.threadID);
        }

        const notificationText = args.join(' ');
        const adminInfo = await new Promise((resolve) => api.getUserInfo(event.senderID, (err, info) => resolve(err ? {} : info)));
        const adminName = adminInfo[event.senderID]?.name || "Admin";
        const sendTime = new Date().toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' });

        const imageUrls = [
            'https://i.ibb.co/j9Yxvsqh/received-1177990383583260.jpg',
            'https://i.ibb.co/366fWs7/received-2074061876450629.jpg',
            'https://i.ibb.co/KjJDQfzN/received-674994471827469.jpg',
            'https://i.ibb.co/7NWWs75y/received-1194786248899049.jpg'
        ];

        const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
        logger.info(`Selected random image URL: ${randomImageUrl}`);

        const notificationMessage = [
            `╭─「 𝐀𝐍𝐍𝐎𝐔𝐍𝐂𝐄𝐌𝐄𝐍𝐓 」─╮`,
            `│ Admin: ${adminName}`,
            `│ Time: ${sendTime} (UTC)`,
            `│ Message: ${notificationText}`,
            `╰─────────────────╯`
        ].join('\n');

        const threadList = await new Promise((resolve) => api.getThreadList(100, null, ['INBOX'], (err, list) => resolve(err ? [] : list)));
        const groupThreads = threadList.filter(thread => thread.isGroup);

        if (groupThreads.length === 0) {
            return api.sendMessage(`${config.bot.botName}: ⚠️ No group chats found to send the notification.`, event.threadID);
        }

        for (const thread of groupThreads) {
            await new Promise((resolve) => {

                api.sendMessage(
                    {
                        body: notificationMessage,
                        attachment: randomImageUrl 
                    },
                    thread.threadID,
                    (err) => {
                        if (err) {
                            logger.error(`Failed to send notification to thread ${thread.threadID}: ${err.message}`);
                        } else {
                            logger.info(`Sent notification with image to thread ${thread.threadID}`);
                        }
                        resolve();
                    }
                );
            });
        }

        api.sendMessage(`${config.bot.botName}: ✅ Notification sent to ${groupThreads.length} group(s) with an image.`, event.threadID);
    }
};
