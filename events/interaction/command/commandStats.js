const fs = require('fs');
const { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const axios = require('axios');
const { logger } = require('../../../functions/logger');
const apiSettings = JSON.parse(fs.readFileSync('config/api.json'));
const { PORT } = require('../../../config/secret.json');

const commandStatsInit = (clientItem) => {
    const client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;

        if(commandName === 'stats') {
            try {
                const select = new StringSelectMenuBuilder()
                    .setCustomId('api_select')
                    .setPlaceholder('Choose an api')
                    .addOptions(
                        apiSettings.api.map((item, index) => {
                            const { name, adress } = item;
                            return new StringSelectMenuOptionBuilder()
                                .setLabel(name)
                                .setDescription(adress)
                                .setValue(name)
                        })
                    );
                const row = new ActionRowBuilder().addComponents(select);
                const response = await interaction.reply({
                    content: 'Choose an api',
                    components: [ row ],
                    ephemeral: true,
                });

                try {
                    const collectorFilter = i => i.user.id === interaction.user.id;
                    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
                    const { values } = confirmation;
                    
                    const statsView = await statsMaker(values);
                    await interaction.editReply({
                        content: `Last 24 hours up time for **${values}**`,
                        components: []
                    });
                } catch(error) {
                    await interaction.editReply({
                        content: 'Response not received within 1 minute, cancelling !',
                        components: []
                    });
                    logger(`🔴 | ${error}`);
                }
            }
            catch(error) { logger(`🔴 | ${error}`); }
        }
    });
}

const statsMaker = async (apiName) => {
    return 'yep';
}

module.exports = { commandStatsInit }