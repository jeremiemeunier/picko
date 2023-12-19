const { Events } = require('discord.js');
const axios = require('axios');
const { logger } = require('../../../functions/logger');
const { BOT_ID } = require('../../../config/secret.json');

const commandConfigInit = (clientItem) => {
    const client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;

        if(commandName === 'setup') {
            try {
                const guild = interaction.guildId;
                const channel = interaction.options.getChannel('channel').id;
                const role = interaction.options.getRole('role').id;

                const registerSetup = await axios({
                    method: "post",
                    url: "http://localhost:3000/setup/",
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
                logger(`🔴 [setup:global:config_command] API Call : ${error}`);
            }
        }
    });
}

module.exports = { commandConfigInit }