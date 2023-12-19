const { options } = require('../config/global.json');
const { BOT_ID } = require('../config/secret.json');
const { color, wait } = options;
const { EmbedBuilder, ChannelType, time } = require('discord.js');
const axios = require('axios');

const { logger } = require('./logger');

const statyPing = async (apiData, params) => {
    let waitingTime;
    const { state, role, guild } = params;

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
            .setTitle(apiData.api_name)
            .setDescription(`You are added to this thread to monitoring api`);
        let pingThread;

        if(state.threads.cache.find(thread => thread.name.endsWith(apiData.api_name))) {
            pingThread = state.threads.cache.find(thread => thread.name.endsWith(apiData.api_name));
            pingThread.setName(`🚀 ${apiData.api_name}`);
        }
        else {
            pingThread = await state.threads.create({
                name: `🚀 ${apiData.api_name}`,
                autoArchiveDuration: 60,
                reason: `Dedicated thread for pinging api ${apiData.api_name}`,
                type: ChannelType.PrivateThread,
            });
        }

        const message = await pingThread.send({
            embeds: [initThreadEmbed],
            content: `<@&${ apiData.role === null ? role : apiData.role }>` });
        const messagePingInit = await pingThread.send({
            embeds: [pingInit, pingEmbed] });

        setInterval(async () => {
            const now = new Date();

            try {
                const request = await axios({
                    method: 'get',
                    url: apiData.api_adress
                });

                try {
                    await axios({
                        method: "post",
                        url: `http://localhost:3000/ping`,
                        data: {
                            name: apiData.api_name,
                            state: true,
                            date: now,
                            guild: guild.id
                        },
                        headers: {
                            statyid: BOT_ID
                        }
                    });
                }
                catch(error) { logger(`🔴 [ping:database:register] ${error}`); }

                if(lastPingState > 1) {
                    try {
                        pingThread.setName(`🟠 ${apiData.api_name}`);
                        apiIsUp = await pingThread.send({ content: `@here API is now UP !` });

                        const pingInit = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`🟠 ${apiData.api_adress}`);
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
                    catch(error) { logger(`🔴 [ping:set_is_reup] ${error}`); }
                }
                else {
                    try {
                        if(apiIsUp !== undefined || lastPingState === 0) {
                            pingThread.setName(`🟢 ${apiData.api_name}`);
                        }
                        
                        const pingInit = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`🟢 ${apiData.api_adress}`);
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
                    catch(error) { logger(`🔴 [ping:set_is_up] ${error}`); }
                }
            }
            catch(error) {
                try {
                    await axios({
                        method: "post",
                        url: `http://localhost:3000/ping`,
                        data: {
                            name: apiData.api_name,
                            state: false,
                            date: now
                        },
                        headers: {
                            statyid: BOT_ID
                        }
                    });
                }
                catch(error) { logger(`🔴 [ping:database:register] ${error}`); }

                if(lastPingState === 2) {
                    try {
                        pingThread.setName(`🔥 ${apiData.api_name}`);

                        const pingInit = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`🔥 ${apiData.api_adress}`);
                        const pingEmbed = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(time(new Date()));
                        messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                        lastPingState = 3;
                    }
                    catch(error) { logger(`🔴 [ping:set_is_down_2] ${error}`); }
                } else if(lastPingState === 3) {
                    try {
                        pingThread.setName(`⚫ ${apiData.api_name}`);

                        const pingInit = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`⚫ ${apiData.api_adress}`);
                        const pingEmbed = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(time(new Date()));
                        messagePingInit.edit({ embeds: [pingInit, pingEmbed] });
                        lastPingState = 3;
                    }
                    catch(error) { logger(`🔴 [ping:set_is_down_3] ${error}`); }
                } else {
                    try {
                        pingThread.setName(`🔴 ${apiData.api_name}`);

                        const pingInit = new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`🔴 ${apiData.api_adress}`);
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
                    catch (error) { logger(`🔴 [ping:set_is_down_1] ${error}`); }
                }
            }
        }, waitingTime);
    }
    catch(error) { await logger(`🔴 [ping:global] ${error}`); }
}

module.exports = { statyPing }