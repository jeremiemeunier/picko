const fs = require('fs');
const secretSettings = JSON.parse(fs.readFileSync('config/secret.json'));
const globalSettings = JSON.parse(fs.readFileSync('config/global.json'));
const apiSettings = JSON.parse(fs.readFileSync('config/api.json'));
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { Client, EmbedBuilder, GatewayIntentBits, Partials, time } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./functions/dateParser.js');
const { xhrStateVerifier } = require('./functions/xhr.js');

let consoleChannel, debug, stateChannel;
const tag = `staty[${globalSettings.version}] `;

const logger = (content) => {
    console.log(content);
    try {
        consoleChannel.messages.fetch().then(messages => {
            let lastLog = messages.first();
            
            if(lastLog !== undefined) {
                let lastLogContent = lastLog.content.slice(0, -3);
            
                try { lastLog.edit(`${lastLogContent}\r\n${tag + content + '```'}`); }
                catch(error) { console.log(error); }
            }
            else {
                consoleChannel.send({ content: '```' + tag + content + '```' });
            }
        });
    } catch(error) {
        console.log(error);
    }
}

const statyPing = async (apiData) => {
    try {
        const message = await stateChannel.send(`🚀 ${apiData.name.slice(8)} - Launch ping at ${time(new Date())}`);

        setInterval(() => {
            const XHR_ApiTester = new XMLHttpRequest();
            XHR_ApiTester.onreadystatechange = () => {
                if(xhrStateVerifier(XHR_ApiTester)) {
                    try { message.edit(`🟢 ${apiData.name.slice(8)} - Last ping at ${time(new Date())}`); }
                    catch(error) { console.log(error); }
                }
                else {
                    try {
                        message.edit(`🔴 ${apiData.name.slice(8)} - Last ping at ${time(new Date())} - @here ➡️ See <#${consoleChannel.id}> for more informations`);
                        console.log(`An error occured on API ping for ${apiData.adress} → ${XHR_ApiTester.status}\r\n${XHR_ApiTester.responseText}`);
                    }
                    catch(error) { console.log(error); }
                }
            }
    
            XHR_ApiTester.open('GET', apiData.adress, false);
            XHR_ApiTester.send();
            
        }, 9000);
    }
    catch(error) { console.log(error); }
}

const booter = () => {
    consoleChannel = client.channels.cache.find(consoleChannel => consoleChannel.name === globalSettings.channels.console);
    debug = client.channels.cache.find(channel => channel.name === globalSettings.channels.debug);
    stateChannel = client.channels.cache.find(channel => channel.name === globalSettings.channels.state);

	try {
        let bootEmbed = new EmbedBuilder()
                                .setColor(globalSettings.options.color)
                                .setDescription(globalSettings.options.name)
                                .addFields(
                                    { name: 'Date starting', value: dateParser(new Date()), inline: true },
                                    { name: 'Debug', value: globalSettings.options.debug.toString(), inline: true },
                                    { name: 'Version', value: globalSettings.version.toString(), inline: true }
                                )
                                .setTimestamp()
                                .setFooter({ text: `Version ${globalSettings.version}`, });
	    // debug.send({ embeds: [bootEmbed] });
        logger('Hello here ! 😊');

        // Lancement de tout les pings
        for(let i = 0;i < apiSettings.api.map(x => x).length;i++) {
            statyPing(apiSettings.api[i]);
        }
    }
    catch(error) {
        // consoleChannel.send({ content: '```An error occured\r\n'+ error +'```' });
        console.log(error);
    }
}

client.on('ready', () => { booter(); });
client.login(secretSettings.BOT_TOKEN);