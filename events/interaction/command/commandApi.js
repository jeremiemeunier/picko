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
                let role = "";
                
                if(interaction.options.getRole('role')) {
                    role = interaction.options.getRole('role').id;
                }
                else { role = null }

                const registerSetup = await axios({
                    method: "post",
                    url: "http://localhost:3000/api/add",
                    headers: {
                        statyid: BOT_ID
                    },
                    data: {
                        guild: guild,
                        role: role,
                        adress: apiAdress,
                        name: apiName
                    }
                });

                await interaction.reply({ content: 'Your api has added to ping list', ephemeral: true });
            }
            catch(error) {
                logger(`🔴 [setup:global:api_command] API Call : ${error}`);
            }
        }
    });
}

module.exports = { commandApiInit }