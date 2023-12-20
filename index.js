const { BOT_TOKEN, BOT_ID } = require('./config/secret.json');
const axios = require('axios');
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { logger } = require('./functions/logger');
const { api } = require('./functions/api');
const { commandRegisterInit, commandRegister } = require('./functions/commandsRegister');
const { interactionCreateEventInit } = require('./events/interactionCreateEvent');
const { statyStarter } = require('./functions/starter');

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

    client.on(Events.GuildCreate, (guild) => {
        logger(`🚀 [staty:on_join] Join a new server : ${guild.id} ${guild.name}`);
        commandRegister(client, guild.id);
        statyStarter(guild.id, guild);
    });
}

client.on('ready', () => { booter(); });
client.login(BOT_TOKEN);