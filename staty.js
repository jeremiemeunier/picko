const fs = require('fs');
const { BOT_TOKEN } = require('./config/secret.json');
const { version, options, channels } = require('./config/global.json');
const apiSettings = JSON.parse(fs.readFileSync('config/api.json'));
const axios = require('axios');
const { Client, EmbedBuilder, GatewayIntentBits, Partials, ChannelType, time } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./functions/dateParser.js');
const { logger, loggerBoot } = require('./functions/logger.js');

let channelConsole, channelDebug, channelState;

const statyPing = async (apiData) => {
    try {
        let lastPingState = 0;
        let apiIsDown = undefined;
        let apiIsUp = undefined;

        const pingInit = new EmbedBuilder()
            .setColor(options.color)
            .setTitle(`🚀 ${apiData.name.slice(8)}`)
            .setDescription(`Staty now monitoring api`);
        const pingEmbed = new EmbedBuilder()
            .setColor(options.color)
            .setDescription(time(new Date()));
        const messagePingInit = await channelState.send({ embeds: [pingInit, pingEmbed] });

        const threadPing = await messagePingInit.startThread({
            name: `🤖 ${apiData.name.slice(8)}`,
            autoArchiveDuration: 60,
            reason: `Dedicated thread for pinging api ${apiData.name.slice(8)}`,
            type: ChannelType.PrivateThread,
        });
        const initThreadEmbed = new EmbedBuilder()
                                    .setColor(options.color)
                                    .setTitle(apiData.name.slice(8))
                                    .setDescription(`You are added to this threads to monitoring api`);
        const message = await threadPing.send({
            content: `<@&${apiData.role === undefined ? (options.role) : (apiData.role)}>`,
            embeds: [initThreadEmbed] });
        const lastPing = await threadPing.send({ embeds: [pingEmbed] });

        setInterval(async () => {
            try {
                const request = await axios({
                    method: 'get',
                    url: apiData.adress
                });

                if(lastPingState > 1) {
                    const pingInit = new EmbedBuilder()
                        .setColor(options.color)
                        .setTitle(`🟠 ${apiData.name.slice(8)}`)
                        .setDescription(`Staty now monitoring api`);
                    const pingEmbed = new EmbedBuilder()
                        .setColor(options.color)
                        .setDescription(time(new Date()));
                    messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                    lastPingState = 1;

                    apiIsUp = await threadPing.send({ content: `@here API is now UP !` });

                    if(apiIsDown !== undefined) {
                        apiIsDown.delete();
                        apiIsDown = undefined;
                    }
                }
                else {
                    const pingInit = new EmbedBuilder()
                        .setColor(options.color)
                        .setTitle(`🟢 ${apiData.name.slice(8)}`)
                        .setDescription(`Staty now monitoring api`);
                    const pingEmbed = new EmbedBuilder()
                        .setColor(options.color)
                        .setDescription(time(new Date()));
                    messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                    lastPingState = 1;

                    if(apiIsUp !== undefined) {
                        apiIsUp.delete();
                        apiIsUp = undefined;
                    }
                }
            }
            catch(error) {
                if(lastPingState === 2) {
                    const pingInit = new EmbedBuilder()
                        .setColor(options.color)
                        .setTitle(`🔥 ${apiData.name.slice(8)}`)
                        .setDescription(`Staty now monitoring api`);
                    const pingEmbed = new EmbedBuilder()
                        .setColor(options.color)
                        .setDescription(time(new Date()));
                    messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                    lastPingState = 3;
                } else if(lastPingState === 3) {
                    const pingInit = new EmbedBuilder()
                        .setColor(options.color)
                        .setTitle(`⚫ ${apiData.name.slice(8)}`)
                        .setDescription(`Staty now monitoring api`);
                    const pingEmbed = new EmbedBuilder()
                        .setColor(options.color)
                        .setDescription(time(new Date()));
                    messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                    lastPingState = 3;
                } else {
                    const pingInit = new EmbedBuilder()
                        .setColor(options.color)
                        .setTitle(`🔴 ${apiData.name.slice(8)}`)
                        .setDescription(`Staty now monitoring api`);
                    const pingEmbed = new EmbedBuilder()
                        .setColor(options.color)
                        .setDescription(time(new Date()));
                    messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                    lastPingState = 2;

                    apiIsDown = await threadPing.send({ content: `@here API is now down !` });
                    const downConsole = new EmbedBuilder()
                            .setColor(options.color)
                            .setTitle(`API is down !`)
                            .setDescription(`\`\`\`An error occured on API ping for ${apiData.adress} → ${error.response.status} [${error.response.statusText}]\`\`\``);
                    threadPing.send({ embeds: [downConsole] });
                }
            }
        }, 60000);
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

        const allThreads = channelState.threads.cache;
        await allThreads.map(thread => {
            thread.delete();
        });

        await channelState.messages.fetch().then(messages => {
            messages.map(message => { message.delete(); });
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