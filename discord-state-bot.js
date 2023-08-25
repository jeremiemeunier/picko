const fs = require('fs');
const secretSettings = JSON.parse(fs.readFileSync('config/secret.json'));
const globalSettings = JSON.parse(fs.readFileSync('config/global.json'));
const alphabetLetters = JSON.parse(fs.readFileSync('config/abc.json'));
const { ChannelType, Client, Events, EmbedBuilder, GatewayIntentBits, Partials, ShardingManager } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { dateParser } = require('./functions/dateParser.js');

let consoleChannel;
let debug;
const tag = `discord_state_bot[${globalSettings.version}] `;

const logger = (content) => {
    consoleChannel.send({ content: '```' + tag + content + '```' });
}

const booter = () => {
    consoleChannel = client.channels.cache.find(consoleChannel => consoleChannel.name === globalSettings.channels.console);
    debug = client.channels.cache.find(channel => channel.name === globalSettings.channels.debug);

	try {
        let bootEmbed = new EmbedBuilder()
                                .setColor('#E0C566')
                                .setDescription(`discord_state_bot`)
                                .addFields(
                                    { name: 'Date starting', value: dateParser(new Date()), inline: true },
                                    { name: 'Debug', value: globalSettings.options.debug.toString(), inline: true },
                                    { name: 'Version', value: globalSettings.version.toString(), inline: true }
                                )
                                .setTimestamp()
                                .setFooter({ text: `Version ${globalSettings.version}`, });
	    //debug.send({ embeds: [bootEmbed] });
        logger('Hello here ! 😊');
    }
    catch(error) { consoleChannel.send({ content: '```An error occured\r\n'+ error +'```' }); }
}



client.on('ready', () => { booter(); });
client.login(secretSettings.BOT_TOKEN);