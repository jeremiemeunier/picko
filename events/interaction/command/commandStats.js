const { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const axios = require('axios');
const { logger } = require('../../../functions/logger');
const { BOT_ID } = require('../../../config/secret.json');

const commandStatsInit = (clientItem) => {
    const client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;

        if(commandName === 'stats') {
            const guild = interaction.guildId;

            try {
                const allApiRequest = await axios({
                    method: "get",
                    url: "http://localhost:3000/api/all",
                    params: {
                        guild: guild
                    },
                    headers: {
                        statyid: BOT_ID
                    }
                });

                const allApiData = allApiRequest.data.data;
                const select = new StringSelectMenuBuilder()
                    .setCustomId('api_select')
                    .setPlaceholder('Choose an api')
                    .addOptions(
                        allApiData.map((item) => {
                            const { api_name, api_adress, _id } = item;
                            return new StringSelectMenuOptionBuilder()
                                .setLabel(api_name)
                                .setDescription(api_adress)
                                .setValue(_id)
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
                    
                    try {
                        const statsView = await statsMaker(values);
                        await interaction.editReply({
                            content: `Last 24 hours pings for **${values}** ${statsView}`,
                            components: []
                        });
                    }
                    catch(error) { logger(`🔴 [api:stats:list] ${error}`); }
                } catch(error) {
                    await interaction.editReply({
                        content: 'Response not received within 1 minute, cancelling !',
                        components: []
                    });
                    logger(`🔴 [api:stats:no_response] ${error}`);
                }
            }
            catch(error) { logger(`🔴 [api:stats:command] ${error}`); }
        }
    });
}

const statsMaker = async (id) => {
    let returnString = "";

    try {
        const allPings = await axios({
            method: "get",
            url: `http://localhost:3000/ping`,
            headers: {
                statyid: BOT_ID
            },
            params: {
                id: id
            }
        });

        const { data } = allPings.data;

        data.map((item, index) => {
            const { state } = item;

            if(state) { returnString = returnString + '◼'; }
            else { returnString = returnString + '◻'; }
        });

        return "```" + returnString + "```";
    }
    catch(error) { logger(`🔴 [api:call] API Call : ${error}`); }
}

module.exports = { commandStatsInit }