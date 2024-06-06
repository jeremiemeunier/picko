import { commandApiInit } from "./interaction/command/commandApi";
import { commandConfigInit } from "./interaction/command/commandConfig";
import { commandStatsInit } from "./interaction/command/commandStats";

export const interactionCreateEventInit = (client) => {
  // Commands
  commandStatsInit(client);
  commandConfigInit(client);
  commandApiInit(client);
};
