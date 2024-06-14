import { interactionCreateEventInit } from "./events/interactionCreateEvent";
import { staty } from "./functions/staty";
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
    staty(guild);
  } catch (error: any) {
    logs("error", "booter:guild_starter", error, guild.id);
  }
};

export const boot: () => void = async () => {
  logs("start", "booter", `Staty has started successfully`);

  status();

  try {
    // API
    api();

    try {
      const allGuilds = client.guilds.cache;

      allGuilds.map((guild) => {
        guild_boot(guild);
      });

      interactionCreateEventInit(client);
    } catch (error: any) {
      logs("error", "booter", error);
    }
  } catch (error: any) {
    logs("error", "api:server", error);
  }

  client.on(Events.GuildCreate, (guild: Guild) => {
    logs(null, "events:new_guild", "Join a new guild", guild.id);
    guild_boot(guild);
    status();
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
