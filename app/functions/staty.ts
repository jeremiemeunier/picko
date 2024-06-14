import { Guild } from "discord.js";
import StatyAxios from "../libs/StatyAxios";
import logs, { composeTime } from "./logs";
import { testing } from "./tester";

export const staty = async (guild: Guild) => {
  try {
    const setup = await StatyAxios.get(`/setup/${guild.id}`, {
      headers: {
        Authorization: `Bearer ${process.env.BOT_ID}`,
      },
    });

    if (setup.data.data) {
      const { role, channel, waiting } = setup.data.data;
      const statsChannel: any = guild.channels.cache.find(
        (statsChannel) => statsChannel.id === channel
      );

      if (statsChannel) {
        try {
          statsChannel.setTopic(`**Started at :** ${composeTime()}`);
        } catch (error: any) {
          logs("error", "staty:update_topic_start", error, guild.id);
        }
      }

      try {
        const fetchAllApi = await StatyAxios.get(`/api/all/${guild.id}`, {
          headers: {
            Authorization: `Bearer ${process.env.BOT_ID}`,
          },
        });

        const allGuildApi = fetchAllApi.data.data;

        logs(
          "success",
          "staty:starting_ping",
          "Successfully getting all api pings",
          guild.id
        );

        allGuildApi.map(
          (api: {
            _id: string;
            guild_id: String;
            role: String;
            api_name: String;
            api_adress: String;
          }) => {
            testing(api, {
              state: statsChannel,
              role: role,
              guild: guild,
              wait: waiting,
            });
          }
        );
      } catch (error: any) {
        logs("error", "staty:starter:launch", error, guild.id);
      }
    }
  } catch (error: any) {
    logs("error", "staty:get_setup", error, guild.id);
  }
};
