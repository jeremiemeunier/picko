const fs = require('fs');
const { BOT_TOKEN, PORT } = require('./config/secret.json');
const { options, channels, database } = require('./config/global.json');
const { version, name } = require('./package.json');
const { color } = options;
const apiSettings = JSON.parse(fs.readFileSync('config/api.json'));
const { Client, EmbedBuilder, GatewayIntentBits, Partials, ChannelType, Events, time } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./functions/dateParser');
const { logger, loggerBoot } = require('./functions/logger');
const { statyPing } = require('./functions/tester');
const { api } = require('./functions/api');
const { commandRegisterInit } = require('./functions/commandsRegister');
const { interactionCreateEventInit } = require('./events/interactionCreateEvent');

const booter = async () => {
    const channelConsole  = client.channels.cache.find(channel => channel.name === channels.console);
    const channelDebug    = client.channels.cache.find(channel => channel.name === channels.debug);
    const channelState    = client.channels.cache.find(channel => channel.name === channels.state);

    let pingArray = [];

    loggerBoot(client, channelConsole);

	try {
        let bootEmbed = new EmbedBuilder()
            .setColor(color)
            .setDescription(name)
            .addFields(
                { name: 'Date starting', value: dateParser(new Date()), inline: true },
                { name: 'Version', value: version.toString(), inline: true },
                { name: 'API', value: database.toString(), inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Version ${version}`, });
	    channelDebug.send({ embeds: [bootEmbed] });
        logger('😊 | Hello here !');

        commandRegisterInit(client);
        interactionCreateEventInit(client);

        if(database) {
            logger('🟢 | Using database for statistics');
            api();
            logger(`🟢 | Lauching API on port : ${PORT}`);
        }
        else { logger('🔴 | Dont use database for statistics'); }

        // Lancement de tout les pings
        for(let i = 0;i < apiSettings.api.map(x => x).length;i++) {
            statyPing(apiSettings.api[i], {
                state: channelState,
                debug: channelDebug,
                console: channelConsole
            });
            pingArray.push(apiSettings.api[i].name);
        }

        const allThreads = channelState.threads.cache;
        await allThreads.map(thread => {
            if(pingArray.indexOf(thread.name.slice(3)) < 0) {
                try { thread.delete(); }
                catch(error) { logger(`🔴 | ${error}`); }
            }
        });
    }
    catch(error) { logger(`🔴 | ${error}`); }
}

client.on('ready', () => {
    booter();
});
client.login(BOT_TOKEN);