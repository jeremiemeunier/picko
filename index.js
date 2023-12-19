const fs = require('fs');
const { BOT_TOKEN, BOT_ID } = require('./config/secret.json');
const { options, channels, database } = require('./config/global.json');
const { version, name } = require('./package.json');
const axios = require('axios');
const { color } = options;
const apiSettings = JSON.parse(fs.readFileSync('config/api.json'));
const { Client, EmbedBuilder, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./functions/dateParser');
const { logger } = require('./functions/logger');
const { statyPing } = require('./functions/tester');
const { api } = require('./functions/api');
const { commandRegisterInit } = require('./functions/commandsRegister');
const { interactionCreateEventInit } = require('./events/interactionCreateEvent');

const statyStarter = async (guildId, guild) => {

    try {
        const setup = await axios({
            method: "get",
            url: "http://localhost:3000/setup",
            params: {
                guild: guildId
            },
            headers: {
                statyid: BOT_ID
            }
        });

        if(setup.data.data) {
            const { role, channel } = setup.data.data;
            const statsChannel = guild.channels.cache.find(statsChannel => statsChannel.id === channel);
            const statsRole = guild.roles.cache.find(statsRole => statsRole.id === role);

            // List all guildId api
            try {
                const allApiRequest = await axios({
                    method: "get",
                    url: "http://localhost:3000/api/all",
                    params: {
                        guild: guildId
                    },
                    headers: {
                        statyid: BOT_ID
                    }
                });

                const allApiList = allApiRequest.data.data;
            }
            catch(error) {
                logger(`🔴 [starter:get_all_api] ${error}`);
            }
        }
    }
    catch(error) {
        logger(`🔴 [starter:get_setup] ${error}`);
    }
}

const booter = () => {
    const allGuilds = client.guilds.cache;

    logger('🟢 [database:use] Using database for statistics');
    api();
    logger(`🟢 [api:launch] Lauching API on port 3000`);

    commandRegisterInit(client);
    interactionCreateEventInit(client);

    allGuilds.map((item, index) => {
        statyStarter(item.id, item);
    });


    // const channelState    = client.channels.cache.find(channel => channel.name === channels.state);

    // let pingArray = [];

	// try {
    //     let bootEmbed = new EmbedBuilder()
    //         .setColor(color)
    //         .setDescription(name)
    //         .addFields(
    //             { name: 'Date starting', value: dateParser(new Date()), inline: true },
    //             { name: 'Version', value: version.toString(), inline: true },
    //             { name: 'API', value: database.toString(), inline: true }
    //         )
    //         .setTimestamp()
    //         .setFooter({ text: `Version ${version}`, });
	//     channelDebug.send({ embeds: [bootEmbed] });
    //     logger('😊 [bot:start] Hello here !');

    //     commandRegisterInit(client);
    //     interactionCreateEventInit(client);

    //     if(database) {
    //         logger('🟢 [database:use] Using database for statistics');
    //         api();
    //         logger(`🟢 [api:launch] Lauching API on port 3000`);
    //     }
    //     else { logger('🔴 [database:use] Dont use database for statistics'); }

    //     // Lancement de tout les pings
    //     for(let i = 0;i < apiSettings.api.map(x => x).length;i++) {
    //         statyPing(apiSettings.api[i], {
    //             state: channelState,
    //             debug: channelDebug,
    //             console: channelConsole
    //         });
    //         pingArray.push(apiSettings.api[i].name);
    //     }

    //     const allThreads = channelState.threads.cache;
    //     await allThreads.map(thread => {
    //         if(pingArray.indexOf(thread.name.slice(3)) < 0) {
    //             try { thread.delete(); }
    //             catch(error) { logger(`🔴 | ${error}`); }
    //         }
    //     });
    // }
    // catch(error) { logger(`🔴 [staty:global] ${error}`); }
}

client.on('ready', () => { booter(); });
client.login(BOT_TOKEN);