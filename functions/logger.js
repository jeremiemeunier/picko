const { version } = require('../package.json');
const tag = `staty[${version}] `;

let channelConsole, client;

const loggerBoot = async (client, channel) => {
    channelConsole = channel;
}

const composeTime = () => {
    const now = new Date();

    const day = now.getDay().length < 2 ? `0${now.getDay()}` : now.getDay();
    const month = now.getMonth().length < 2 ? `0${now.getMonth()}` : now.getMonth();
    const year = now.getFullYear();

    const hours = now.getHours().length < 2 ? `0${now.getHours()}` : now.getHours();
    const minutes = now.getMinutes().length < 2 ? `0${now.getMinutes()}` : now.getMinutes();
    const seconds = now.getSeconds().length < 2 ? `0${now.getSeconds()}` : now.getSeconds();
    const miliseconds = now.getMilliseconds().length < 3 ? `0${now.getMilliseconds()}` : now.getMilliseconds();

    return `[${day}/${month}/${year} ${hours}:${minutes}:${seconds}.${miliseconds}]`;
}

const logger = async (content) => {
    const now = new Date();

    console.log(`${composeTime()} ${tag}${content}`);
    
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
    } catch(error) { console.log(`${logDate} ${tag}${error}`); }
}

module.exports = { logger, loggerBoot }