const { version } = require('../package.json');
const tag = `staty[${version}] `;

let channelConsole, client;

const loggerBoot = async (client, channel) => {
    channelConsole = channel;
}

const logger = async (content) => {
    console.log(tag + content);
    try {
        channelConsole.messages.fetch().then(messages => {
            let lastLog = messages.first();
            
            if(lastLog !== undefined) {
                let lastLogContent = lastLog.content.slice(0, -3);
                let newLogContent = `${lastLogContent}\r\n${tag + content + '```'}`;

                if(newLogContent.length >= 2000) {
                    try { channelConsole.send({ content: '```' + tag + content + '```' }); }
                    catch(error) { console.log(error); }
                }
                else {
                    try { lastLog.edit(newLogContent); }
                    catch(error) { console.log(error); }
                }
            }
            else { channelConsole.send({ content: '```' + tag + content + '```' }); }
        });
    } catch(error) { console.log(error); }
}

module.exports = { logger, loggerBoot }