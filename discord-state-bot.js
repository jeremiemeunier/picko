const fs = require('fs');
const secretSettings = JSON.parse(fs.readFileSync('config/secret.json'));
const globalSettings = JSON.parse(fs.readFileSync('config/global.json'));
const alphabetLetters = JSON.parse(fs.readFileSync('config/abc.json'));
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { ChannelType, Client, Events, EmbedBuilder, GatewayIntentBits, Partials, ShardingManager, ActivityType, time } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./functions/dateParser.js');
const { xhrStateVerifier } = require('./functions/xhr.js');

let consoleChannel;
let debug;
let stateChannel;
const tag = `discord_state_bot[${globalSettings.version}] `;

const logger = (content) => {
    console.log(content);
    consoleChannel.send({ content: '```' + tag + content + '```' });
}

const digitalTeaCompanyApi = async () => {
    const ApiAdress = 'https://api.digitalteacompany.fr';
    
    try {
        const message = await stateChannel.send(`🚀 ${ApiAdress.slice(8)} - Launch ping at ${time(new Date())}`);
        console.log(message.id);

        setInterval(() => {
            const XHR_ApiTester = new XMLHttpRequest();
            console.log(message.id);
    
            XHR_ApiTester.onreadystatechange = () => {
                if(xhrStateVerifier(XHR_ApiTester)) {
                    try {
                        message.edit(`🟢 ${ApiAdress.slice(8)} - Last ping at ${time(new Date())}`);
                    }
                    catch(error) { logger(error); }
                }
                else {
                    try {
                        message.edit(`🔴 ${ApiAdress.slice(8)} - Last ping at ${time(new Date())} - See <#${consoleChannel.id}> for more informations`);
                        logger(`An error occured on API ping for ${ApiAdress}\r
                        statusText {\r
                            errno: ${XHR_ApiTester.statusText.errno}\r
                            code: ${XHR_ApiTester.statusText.code}\r
                            syscall: ${XHR_ApiTester.statusText.syscall}\r
                            hostname: ${XHR_ApiTester.statusText.hostname}\r
                        }`);
                    }
                    catch(error) { logger(error); }
                }
            }
    
            XHR_ApiTester.open('GET', ApiAdress, false);
            XHR_ApiTester.send();
        }, 300000);
    }
    catch(error) { logger(error); }
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
	    debug.send({ embeds: [bootEmbed] });
        logger('Hello here ! 😊');

        // Lancement de tout les scripts de ping
        digitalTeaCompanyApi();
    }
    catch(error) { consoleChannel.send({ content: '```An error occured\r\n'+ error +'```' }); }
}

client.on('ready', () => { booter(); });
client.login(secretSettings.BOT_TOKEN);