const { options } = require('../config/global.json');
const { color, wait } = options;
const { EmbedBuilder, ChannelType, time } = require('discord.js');
const axios = require('axios');

const { logger } = require('../functions/logger');

const statyPing = async (apiData, channels) => {
    let waitingTime;
    const { state } = channels;

    {wait >= 300000 ?
        (waitingTime = wait) :
        (waitingTime = 300000)}

    try {
        let lastPingState = 0;
        let apiIsDown = undefined;
        let apiIsUp = undefined;

        const pingInit = new EmbedBuilder()
            .setColor(color)
            .setDescription(`🚀 Staty now monitoring api`);
        const pingEmbed = new EmbedBuilder()
            .setColor(color)
            .setDescription(time(new Date()));
        const initThreadEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle(apiData.name)
            .setDescription(`You are added to this thread to monitoring api`);

        const pingThread = await state.threads.create({
            name: `🚀 ${apiData.name}`,
            autoArchiveDuration: 60,
            reason: `Dedicated thread for pinging api ${apiData.name}`,
            type: ChannelType.PrivateThread,
        });

        const message = await pingThread.send({ embeds: [initThreadEmbed], content: `<@&${ apiData.role === undefined ? options.role : apiData.role }>` });
        const messagePingInit = await pingThread.send({ embeds: [pingInit, pingEmbed] });

        setInterval(async () => {
            try {
                const request = await axios({
                    method: 'get',
                    url: apiData.adress
                });

                if(lastPingState > 1) {
                    try {
                        pingThread.setName(`🟠 ${apiData.name}`);
                        apiIsUp = await pingThread.send({ content: `@here API is now UP !` });

                        const pingInit = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`🟠 ${apiData.adress}`);
                        const pingEmbed = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(time(new Date()));
                        messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                        lastPingState = 1;

                        if(apiIsDown !== undefined) {
                            apiIsDown.delete();
                            apiIsDown = undefined;
                        }
                    }
                    catch(error) { logger(error); }
                }
                else {
                    try {
                        if(apiIsUp !== undefined || lastPingState === 0) {
                            pingThread.setName(`🟢 ${apiData.name}`);
                        }
                        
                        const pingInit = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`🟢 ${apiData.adress}`);
                        const pingEmbed = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(time(new Date()));
                        messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                        lastPingState = 1;
    
                        if(apiIsUp !== undefined) {
                            apiIsUp.delete();
                            apiIsUp = undefined;
                        }
                    }
                    catch(error) { logger(error); }
                }
            }
            catch(error) {
                if(lastPingState === 2) {
                    try {
                        pingThread.setName(`🔥 ${apiData.name}`);

                        const pingInit = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`🔥 ${apiData.adress}`);
                        const pingEmbed = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(time(new Date()));
                        messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                        lastPingState = 3;
                    }
                    catch(error) { logger(error); }
                } else if(lastPingState === 3) {
                    try {
                        pingThread.setName(`⚫ ${apiData.name}`);

                        const pingInit = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`⚫ ${apiData.adress}`);
                        const pingEmbed = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(time(new Date()));
                        messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                        lastPingState = 3;
                    }
                    catch(error) { logger(error); }
                } else {
                    try {
                        pingThread.setName(`🔴 ${apiData.name}`);

                        const pingInit = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`🔴 ${apiData.adress}`);
                        const pingEmbed = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(time(new Date()));
                        messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                        lastPingState = 2;

                        apiIsDown = await pingThread.send({ content: `@here API is now down !` });
                        const downConsole = new EmbedBuilder()
                            .setColor(color)
                            .setTitle(`API is down !`)
                            .setDescription(`Find here log for latest ping\r\n\`\`\`An error occured on API ping for ${apiData.adress} → ${error.response.status} [${error.response.statusText}]\`\`\``);
                        pingThread.send({ embeds: [downConsole] });
                    }
                    catch (error) { logger(error); }
                }
            }
        }, waitingTime);
    }
    catch(error) { await logger(error); }
}

module.exports = { statyPing }