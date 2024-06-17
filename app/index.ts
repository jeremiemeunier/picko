import { interactionCreateEventInit } from "./events/interactionCreateEvent";
import { __staty__init__ } from "./functions/staty";
import * as cron from "node-cron";
import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActivityType,
  Guild,
} from "discord.js";

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

// ##### IMPORT ##### \\

import logs from "./functions/logs";
import api from "./functions/api";
import { register_in_guild } from "./functions/register";

// ##### APP ##### \\

const status: () => void = async () => {
  const allGuilds = client.guilds.cache;
  const guildLength = allGuilds.map((x: any) => x).length;

  if (client && client.user) {
    client.user.setPresence({
      activities: [
        {
          name: `Ensures API monitoring on ${
            guildLength > 1 ? `${guildLength} servers` : `${guildLength} server`
          }`,
          type: ActivityType.Custom,
        },
      ],
    });
  }
};

const guild_boot = (guild: Guild) => {
  try {
    logs(
      "start",
      "booter:guild_starter",
      `Start all functions for ${guild.name}`,
      guild.id
    );
    register_in_guild(guild.id);
  } catch (error: any) {
    logs("error", "booter:guild_starter", error, guild.id);
  }
};

export const boot: () => void = async () => {
  logs("start", "booter", `Staty has started successfully`);
  // update status
  status();
  // launch api
  api();
  // start receive event from commands
  interactionCreateEventInit(client);

  try {
    const allGuilds = client.guilds.cache;
    allGuilds.map((guild) => guild_boot(guild));
  } catch (error: any) {
    logs("error", "booter", error);
  }

  client.on(Events.GuildCreate, (guild: Guild) => {
    logs(null, "events:new_guild", "Join a new guild", guild.id);
    guild_boot(guild);
    status();
  });

  // starting cron for pings
  cron.schedule("* * * * *", () => {
    __staty__init__(client);
  });
};

try {
  client.once(Events.ClientReady, () => {
    boot();
  });
  client.login(process.env.BOT_TOKEN);
} catch (error: any) {
  logs("error", "client:connect", error);
}
