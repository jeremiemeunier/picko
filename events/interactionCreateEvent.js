const { commandConfigInit } = require('./interaction/command/commandConfig');
const { commandStatsInit } = require('./interaction/command/commandStats');

let client;

const interactionCreateEventInit = (clientItem) => {

    client = clientItem;

    // Commands
    commandStatsInit(client);
    commandConfigInit(client);
}

module.exports = { interactionCreateEventInit }