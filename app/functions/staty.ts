import { Client, Guild } from "discord.js";
import StatyAxios from "../libs/StatyAxios";
import logs, { composeTime } from "./logs";
import { staty_worker } from "./worker";
import { ApiTypes } from "../interfaces/Api.types";

export const __staty__init__ = async (client: Client) => {
  // map all guilds
  try {
    const allGuilds = client.guilds.cache;
    allGuilds.map(async (guild) => staty(guild));
  } catch (error: any) {
    logs("error", "staty:boot:all_guilds", error);
  }
};

const get_setup = async (guild: Guild) => {
  try {
    const setup = await StatyAxios.get(`/setup/${guild.id}`, {
      headers: {
        Authorization: `Bearer ${process.env.BOT_ID}`,
      },
    });

    return setup.data.data;
  } catch (error: any) {
    logs("error", "staty:get:setup", error.message, guild.id);
    return false;
  }
};

const get_api_list = async (guild: Guild) => {
  try {
    const fetchData = await StatyAxios.get(`/api/all/${guild.id}`, {
      headers: {
        Authorization: `Bearer ${process.env.BOT_ID}`,
      },
    });
    return fetchData.data.data;
  } catch (error: any) {
    logs("error", "staty:get:guild:api:list", error.message, guild.id);
    return false;
  }
};

const staty = async (guild: Guild) => {
  const config = await get_setup(guild);

  if (config) {
    const { role, channel, waiting } = config;
    const guildChannel: any = guild.channels.cache.find(
      (guildChannel) => guildChannel.id === channel
    );

    // setup topic of channel
    if (guildChannel) {
      try {
        guildChannel.setTopic(`**Started at :** ${composeTime()}`);
      } catch (error: any) {
        logs("error", "staty:update:topic:start", error, guild.id);
      }
    }

    try {
      const apiList = await get_api_list(guild);
      apiList.map((api: ApiTypes) => {
        staty_worker(api, {
          state: guildChannel,
          role: role,
          guild: guild,
          wait: waiting,
        });
      });
    } catch (error: any) {
      logs("error", "staty:starter:launch", error, guild.id);
    }
  } else {
    logs(
      "error",
      "staty:setup",
      "No config provided or init on this guild",
      guild.id
    );
  }
};
