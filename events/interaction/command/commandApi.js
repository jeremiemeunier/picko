const { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ModalBuilder, RoleSelectMenuBuilder } = require('discord.js');
const axios = require('axios');
const { logger } = require('../../../functions/logger');
const { BOT_ID } = require('../../../config/secret.json');

const commandApiInit = (clientItem) => {
    const client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;

        if(commandName === 'api') {
            try {
                const guild = interaction.guildId;
                const apiName = interaction.options.getString('name');
                const apiAdress = interaction.options.getString('adress');
                const role = interaction.options.getRole('role').id;

                const registerSetup = await axios({
                    method: "post",
                    url: "http://localhost:3000/api/add/",
                    headers: {
                        statyid: BOT_ID
                    },
                    data: {
                        guild: guild,
                        channel: channel,
                        role: role
                    }
                });

                await interaction.reply({ content: 'Your setup is ready', ephemeral: true });
            }
            catch(error) {
                logger(`🔴 [setup:global] API Call : ${error}`);
            }
        }
    });
}

module.exports = { commandApiInit }