const { commandApiInit } = require("./interaction/command/commandApi");
const { commandConfigInit } = require("./interaction/command/commandConfig");
const { commandStatsInit } = require("./interaction/command/commandStats");

const interactionCreateEventInit = (client) => {
  // Commands
  commandStatsInit(client);
  commandConfigInit(client);
  commandApiInit(client);
};

module.exports = { interactionCreateEventInit };
