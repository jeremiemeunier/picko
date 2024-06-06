import { Client, GatewayIntentBits, Partials, Events } from "discord.js";
import { logger } from "./functions/logger";
import { api } from "./functions/api";
import {
  commandRegisterInit,
  commandRegister,
} from "./functions/commandsRegister";
import { interactionCreateEventInit } from "./events/interactionCreateEvent";
import { statyStarter } from "./functions/starter";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const booter = () => {
  const allGuilds = client.guilds.cache;

  logger("🟢 [database:use] Using database for statistics");
  api();
  logger(
    `🟢 [api:launch] Lauching API on port ${
      process.env.DEV === "1" ? "4000" : "3000"
    }`
  );

  commandRegisterInit(client);
  interactionCreateEventInit(client);

  allGuilds.map((item) => {
    statyStarter(item.id, item);
  });

  client.on(Events.GuildCreate, (guild) => {
    logger(`🚀 [staty:on_join] Join a new server : ${guild.id} ${guild.name}`);
    commandRegister(guild.id);
    statyStarter(guild.id, guild);
  });
};

client.on("ready", () => {
  booter();
});
client.login(process.env.BOT_TOKEN);
