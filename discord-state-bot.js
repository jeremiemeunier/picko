const fs = require('fs');
const { BOT_TOKEN, BOT_OWNER_ID, GUILD_ID, BOT_ID } = require('./config/secret.json');
const { version, options, channels } = require('./config/global.json');
const apiSettings = JSON.parse(fs.readFileSync('config/api.json'));
const axios = require('axios');
const { Client, EmbedBuilder, GatewayIntentBits, Partials, time } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./functions/dateParser.js');
const { removeMessage } = require('./functions/removeMessage.js');
const { logger, loggerBoot } = require('./functions/logger.js');

let channelConsole, channelDebug, channelState;

const statyPing = async (apiData) => {
    try {
        let message = await channelState.send(`🚀 \`${apiData.name.slice(8)}\` - Launch ping at ${time(new Date())}`);
        let lastPingState = 0;
        let messageIsHere, downMessage;

        setInterval(async () => {
            try {
                messageIsHere = await channelState.messages.fetch(message.id);
            }
            catch(error) { logger(error); }

            if(messageIsHere === '' || messageIsHere === undefined) {
                message = await channelState.send(`🚀 \`${apiData.name.slice(8)}\` - Launch ping at ${time(new Date())}`);
            }

            try {
                const request = await axios({
                    method: 'get',
                    url: apiData.adress
                });

                if(lastPingState > 1) {
                    await message.edit(`🟠 \`${apiData.name.slice(8)}\` - Last ping at ${time(new Date())}`);
                    lastPingState = 1;
                    removeMessage(downMessage);
                }
                else {
                    await message.edit(`🟢 \`${apiData.name.slice(8)}\` - Last ping at ${time(new Date())}`);
                    lastPingState = 1;
                }
            }
            catch(error) {
                if(lastPingState === 2) {
                    await message.edit(`🔥 \`${apiData.name.slice(8)}\` - Last ping at ${time(new Date())} - <@&${options.role}> ➡️ See <#${channelConsole.id}> for more informations`);
                    lastPingState = 3;
                    downMessage.edit(`<@&${options.role}> \`${apiData.name.slice(8)}\` is down ! \`ping 2\``);
                } else if(lastPingState === 3) {
                    await message.edit(`⚫ \`${apiData.name.slice(8)}\` - Last ping at ${time(new Date())} - <@&${options.role}> ➡️ See <#${channelConsole.id}> for more informations`);
                    downMessage.edit(`<@&${options.role}> \`${apiData.name.slice(8)}\` is down ! \`ping 3\``);
                } else {
                    await message.edit(`🔴 \`${apiData.name.slice(8)}\` - Last ping at ${time(new Date())} - <@&${options.role}> ➡️ See <#${channelConsole.id}> for more informations`);
                    await logger(`An error occured on API ping for ${apiData.adress} → ${error.response.status} [${error.response.statusText}]`);
                    lastPingState = 2;

                    downMessage = await channelState.send(`<@&${options.role}> \`${apiData.name.slice(8)}\` is down ! \`ping 1\``);
                }
            }
        }, options.wait);
    }
    catch(error) { await logger(error); }
}

const booter = async () => {
    channelConsole  = client.channels.cache.find(channel => channel.name === channels.console);
    channelDebug    = client.channels.cache.find(channel => channel.name === channels.debug);
    channelState    = client.channels.cache.find(channel => channel.name === channels.state);

    loggerBoot(client, channelConsole);

	try {
        let bootEmbed = new EmbedBuilder()
                                .setColor(options.color)
                                .setDescription(options.name)
                                .addFields(
                                    { name: 'Date starting', value: dateParser(new Date()), inline: true },
                                    { name: 'Version', value: version.toString(), inline: true }
                                )
                                .setTimestamp()
                                .setFooter({ text: `Version ${version}`, });
	    channelDebug.send({ embeds: [bootEmbed] });
        logger('Hello here ! 😊');

        await channelState.messages.fetch().then(messages => {
            messages.map(message => removeMessage(message));
        });

        // Lancement de tout les pings
        for(let i = 0;i < apiSettings.api.map(x => x).length;i++) {
            statyPing(apiSettings.api[i]);
        }
    }
    catch(error) { logger(error); }
}

client.on('ready', () => {
    booter();
});
client.login(BOT_TOKEN);