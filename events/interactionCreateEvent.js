const { commandStatsInit } = require('./interaction/command/commandStats');

let client;

const interactionCreateEventInit = (clientItem) => {

    client = clientItem;

    // Commands
    commandStatsInit(client);
}

module.exports = { interactionCreateEventInit }