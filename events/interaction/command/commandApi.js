const { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const axios = require('axios');
const { logger } = require('../../../functions/logger');
const { BOT_ID } = require('../../../config/secret.json');
const { statyStarter } = require('../../../functions/starter');

const commandApiInit = (clientItem) => {
    const client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if(!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;

        if(commandName === 'api') {
            if(interaction.options.getSubcommand() === 'add') {
                try {
                    const guildId = interaction.guildId;
                    const guild = client.guilds.cache.find(guild => guild.id === guildId);
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
                            guild: guildId,
                            role: role,
                            adress: apiAdress,
                            name: apiName
                        }
                    });

                    await interaction.reply({
                        content: 'Your api has added to ping list, await automatic restart for pinging',
                        ephemeral: true });
                    statyStarter(guildId, guild);
                }
                catch(error) {
                    logger(`🔴 [setup:global:api_command] API Call : ${error}`);
                }
            }
            else if(interaction.options.getSubcommand() === 'remove') {
                const guildId = interaction.guildId;
                const guild = client.guilds.cache.find(guild => guild.id === guildId);

                try {
                    const allApiRequest = await axios({
                        method: "get",
                        url: "http://localhost:3000/api/all",
                        params: {
                            guild: guildId
                        },
                        headers: {
                            statyid: BOT_ID
                        }
                    });

                    const allApiData = allApiRequest.data.data;

                    if(allApiData) {
                        const select = new StringSelectMenuBuilder()
                            .setCustomId('api_select')
                            .setPlaceholder('Choose an api to remove')
                            .addOptions(
                                allApiData.map((item, index) => {
                                    const { api_name, api_adress, _id } = item;
                                    return new StringSelectMenuOptionBuilder()
                                        .setLabel(api_name)
                                        .setDescription(api_adress)
                                        .setValue(_id)
                                })
                            );
                        const row = new ActionRowBuilder().addComponents(select);
                        const response = await interaction.reply({
                            content: 'Choose an api to remove',
                            components: [ row ],
                            ephemeral: true,
                        });

                        try {
                            const collectorFilter = i => i.user.id === interaction.user.id;
                            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
                            const { values } = confirmation;
                            
                            try {
                                await axios({
                                    method: "delete",
                                    url: "http://localhost:3000/api/remove",
                                    params: {
                                        id: values
                                    },
                                    headers: {
                                        statyid: BOT_ID
                                    }
                                });

                                interaction.editReply({
                                    content: "Api removed from pinging",
                                    components: [],
                                    ephemeral: false });
                                statyStarter(guildId, guild);
                            }
                            catch(error) { logger(`🔴 [commande:api:remove_request] ${error}`); }
                        } catch(error) {
                            await interaction.editReply({
                                content: 'Response not received within 1 minute, cancelling !',
                                components: []
                            });
                            logger(`🔴 [command:remove:api:no_response] ${error}`);
                        }
                    }
                }
                catch(error) {
                    logger(`🔴 [command:api:remove] ${error}`);
                }
            }
            else {
                interaction.reply({ content: "Invalid command", ephemeral: true });
            }
        }
    });
}

module.exports = { commandApiInit }