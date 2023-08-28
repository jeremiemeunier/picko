const { version, options, channels } = require('../config/global.json');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const tag = `staty[${version}] `;
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const channelConsole  = client.channels.cache.find(channel => channel.name === channels.console);

const logger = async (content) => {
    console.log(tag + content);
    try {
        channelConsole.messages.fetch().then(messages => {
            let lastLog = messages.first();
            
            if(lastLog !== undefined) {
                let lastLogContent = lastLog.content.slice(0, -3);
                let newLogContent = `${lastLogContent}\r\n${tag + content + '```'}`;

                if(newLogContent.length >= 2000) {
                    try { channelConsole.send({ content: '```' + tag + content + '```' }); }
                    catch(error) { console.log(error); }
                }
                else {
                    try { lastLog.edit(newLogContent); }
                    catch(error) { console.log(error); }
                }
            }
            else { channelConsole.send({ content: '```' + tag + content + '```' }); }
        });
    } catch(error) { console.log(error); }
}

module.exports = { logger }