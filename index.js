const { BOT_TOKEN, BOT_ID } = require('./config/secret.json');
const axios = require('axios');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
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
                let pingArray = [];

                // Lancement de tout les pings

                allApiList.map((item, index) => {
                    statyPing(item, {
                        state: statsChannel,
                        role: role
                    });

                    pingArray.push(item.api_name);
                });

                const allThreads = statsChannel.threads.cache;
                await allThreads.map(thread => {
                    if(pingArray.indexOf(thread.name.slice(3)) < 0) {
                        try { thread.delete(); }
                        catch(error) { logger(`🔴 | ${error}`); }
                    }
                });

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
}

client.on('ready', () => { booter(); });
client.login(BOT_TOKEN);