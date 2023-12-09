const fs = require('fs');
const { Events, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ModalBuilder, RoleSelectMenuBuilder } = require('discord.js');
const axios = require('axios');
const { logger } = require('../../../functions/logger');
const apiSettings = JSON.parse(fs.readFileSync('config/api.json'));
const { PORT, BOT_ID } = require('../../../config/secret.json');

const commandConfigInit = (clientItem) => {
    const client = clientItem;

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;

        if(commandName === 'config') {
            try {
                
            }
            catch(error) {
                console.log(error)
            }
        }
    });
}

module.exports = { commandConfigInit }