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
import { register_in_guild } from "./functions/register";
import { __picko__init__ } from "./functions/picko";

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
      "boot:guild_starter",
      `Start all functions for ${guild.name}`,
      guild.id
    );
    register_in_guild(guild.id);
  } catch (error: any) {
    logs("error", "boot:guild_starter", error, guild.id);
  }
};

export const boot: () => void = async () => {
  logs("start", "boot", `picko has started successfully`);
  // update status
  status();

  try {
    const allGuilds = client.guilds.cache;
    allGuilds.map((guild) => guild_boot(guild));
  } catch (error: any) {
    logs("error", "boot", error);
  }

  client.on(Events.GuildCreate, (guild: Guild) => {
    logs(null, "events:new_guild", "Join a new guild", guild.id);
    guild_boot(guild);
    status();
  });

  // starting cron for pings
  cron.schedule("* * * * *", () => {
    __picko__init__(client);
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
