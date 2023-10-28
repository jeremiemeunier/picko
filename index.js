const fs = require('fs');
const { BOT_TOKEN, PORT } = require('./config/secret.json');
const { options, channels, database } = require('./config/global.json');
const { version } = require('./package.json');
const { color } = options;
const apiSettings = JSON.parse(fs.readFileSync('config/api.json'));
const axios = require('axios');
const { Client, EmbedBuilder, GatewayIntentBits, Partials, ChannelType, Events, time } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./functions/dateParser');
const { logger, loggerBoot } = require('./functions/logger');
const { statyPing } = require('./functions/ping');
const { api } = require('./functions/api');
let channelConsole, channelDebug, channelState;

const booter = async () => {
    channelConsole  = client.channels.cache.find(channel => channel.name === channels.console);
    channelDebug    = client.channels.cache.find(channel => channel.name === channels.debug);
    channelState    = client.channels.cache.find(channel => channel.name === channels.state);

    loggerBoot(client, channelConsole);

    if(database) {
        logger('Using database for statistics');
        api();
        logger(`Lauching API on port : ${PORT}`);
    }

	try {
        let bootEmbed = new EmbedBuilder()
            .setColor(color)
            .setDescription(options.name)
            .addFields(
                { name: 'Date starting', value: dateParser(new Date()), inline: true },
                { name: 'Version', value: version.toString(), inline: true },
                { name: 'API', value: database.toString(), inline: true }
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
            statyPing(apiSettings.api[i], {
                state: channelState,
                debug: channelDebug,
                console: channelConsole
            });
        }
    }
    catch(error) { logger(error); }
}

client.on('ready', () => {
    booter();
});
client.login(BOT_TOKEN);