const fs = require('fs');
const secretSettings = JSON.parse(fs.readFileSync('config/secret.json'));
const globalSettings = JSON.parse(fs.readFileSync('config/global.json'));
const apiSettings = JSON.parse(fs.readFileSync('config/api.json'));
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const axios = require('axios');
const { Client, EmbedBuilder, GatewayIntentBits, Partials, time } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./functions/dateParser.js');
const { xhrStateVerifier, xhrStatusVerifier } = require('./functions/xhr.js');

let consoleChannel, debug, stateChannel;
const tag = `staty[${globalSettings.version}] `;

const logger = async (content) => {
    console.log(tag + content);
    try {
        consoleChannel.messages.fetch().then(messages => {
            let lastLog = messages.first();
            
            if(lastLog !== undefined) {
                let lastLogContent = lastLog.content.slice(0, -3);
                let newLogContent = `${lastLogContent}\r\n${tag + content + '```'}`;

                if(newLogContent.length >= 2000) {
                    try { consoleChannel.send({ content: '```' + tag + content + '```' }); }
                    catch(error) { console.log(error); }
                }
                else {
                    try { lastLog.edit(newLogContent); }
                    catch(error) { console.log(error); }
                }
            }
            else { consoleChannel.send({ content: '```' + tag + content + '```' }); }
        });
    } catch(error) { console.log(error); }
}

const removeMessage = async (message) => {
    await message.delete();
}

const statyPing = async (apiData) => {
    try {
        const message = await stateChannel.send(`🚀 \`${apiData.name.slice(8)}\` - Launch ping at ${time(new Date())}`);
        await logger(`Binding message ${message.id} for ${apiData.name.slice(8)}...`);
        await logger(`Message binded for ${apiData.name.slice(8)}`);
        await logger(`Set last ping state for ${apiData.name.slice(8)}...`);
        let lastPingState = 0;
        await logger(`State ping set to 0 for ${apiData.name.slice(8)}`);

        setInterval(async () => {
            try {
                const request = await axios({
                    method: 'get',
                    url: apiData.adress
                });

                if(lastPingState > 1) {
                    await message.edit(`🟠 \`${apiData.name.slice(8)}\` - Last ping at ${time(new Date())}`);
                    lastPingState = 1;
                }
                else {
                    await message.edit(`🟢 \`${apiData.name.slice(8)}\` - Last ping at ${time(new Date())}`);
                    lastPingState = 1;
                }
            }
            catch(error) {
                if(lastPingState === 2) {
                    await message.edit(`🔥 \`${apiData.name.slice(8)}\` - Last ping at ${time(new Date())} - @here ➡️ See <#${consoleChannel.id}> for more informations`);
                    lastPingState = 3;
                } else if(lastPingState === 3) {
                    await message.edit(`⚫ \`${apiData.name.slice(8)}\` - Last ping at ${time(new Date())} - @here ➡️ See <#${consoleChannel.id}> for more informations`);
                } else {
                    await message.edit(`🔴 \`${apiData.name.slice(8)}\` - Last ping at ${time(new Date())} - @here ➡️ See <#${consoleChannel.id}> for more informations`);
                    await logger(`An error occured on API ping for ${apiData.adress} → ${error.response.status}\r\n${error.response.statusText}`);
                    lastPingState = 2;
                }
            }
        }, globalSettings.options.wait);
    }
    catch(error) { await logger(error); }
}

const booter = async () => {
    consoleChannel = client.channels.cache.find(consoleChannel => consoleChannel.name === globalSettings.channels.console);
    debug = client.channels.cache.find(channel => channel.name === globalSettings.channels.debug);
    stateChannel = client.channels.cache.find(channel => channel.name === globalSettings.channels.state);

	try {
        let bootEmbed = new EmbedBuilder()
                                .setColor(globalSettings.options.color)
                                .setDescription(globalSettings.options.name)
                                .addFields(
                                    { name: 'Date starting', value: dateParser(new Date()), inline: true },
                                    { name: 'Version', value: globalSettings.version.toString(), inline: true }
                                )
                                .setTimestamp()
                                .setFooter({ text: `Version ${globalSettings.version}`, });
	    debug.send({ embeds: [bootEmbed] });
        logger('Hello here ! 😊');

        logger('Cleaning old ping messages...');
        await stateChannel.messages.fetch().then(messages => {
            messages.map(message => removeMessage(message));
        });

        // Lancement de tout les pings
        logger('Start pinging...');
        for(let i = 0;i < apiSettings.api.map(x => x).length;i++) {
            statyPing(apiSettings.api[i]);
        }
        logger('I\'m pinging');
    }
    catch(error) { logger(error); }
}

client.on('ready', () => { booter(); });
client.login(secretSettings.BOT_TOKEN);