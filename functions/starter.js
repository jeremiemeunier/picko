import StatyAxios from "../libs/StatyAxios";
import { composeTime, logger } from "./logger";
import { statyPing } from "./tester";

export const statyStarter = async (guildId, guild) => {
  try {
    const setup = await StatyAxios.get("/setup", {
      params: {
        guild: guildId,
      },
      headers: {
        statyid: process.env.BOT_ID,
      },
    });

    if (setup.data.data) {
      const { role, channel, waiting } = setup.data.data;
      const statsChannel = guild.channels.cache.find(
        (statsChannel) => statsChannel.id === channel
      );

      const wait = waiting >= 300000 ? waiting : 300000;
      const start = composeTime(new Date());

      try {
        statsChannel.setTopic(`**Started at :** ${start}`);

        setInterval(() => {
          try {
            statsChannel.setTopic(
              `**Started at :** ${start} — **Last ping at :** ${composeTime(new Date())}`
            );
          } catch (error) {
            logger(`🔴 [starter:update_topic_interval] ${error}`);
          }
        }, wait);
      } catch (error) {
        logger(`🔴 [starter:update_topic] ${error}`);
      }

      try {
        const allApiRequest = await StatyAxios.get("/api/all", {
          params: {
            guild: guildId,
          },
          headers: {
            statyid: process.env.BOT_ID,
          },
        });

        const allApiList = allApiRequest.data.data;
        let pingArray = [];

        logger(`🟢 [starter:starting] Start all pings`);

        allApiList.map((item) => {
          statyPing(item, {
            state: statsChannel,
            role: role,
            guild: guild,
            wait: waiting,
          });
        });
      } catch (error) {
        logger(`🔴 [starter:get_all_api] ${error}`);
      }
    }
  } catch (error) {
    logger(`🔴 [starter:get_setup] ${error}`);
  }
};

export const newApiStarter = async (guild, apiId) => {
  try {
    const setup = await StatyAxios.get("/setup", {
      params: {
        guild: guild.id,
      },
      headers: {
        statyid: process.env.BOT_ID,
      },
    });

    if (setup.data.data) {
      const { role, channel } = setup.data.data;
      const statsChannel = guild.channels.cache.find(
        (statsChannel) => statsChannel.id === channel
      );

      // List all guildId api
      try {
        const apiRequest = await StatyAxios.get("/api/id", {
          headers: {
            statyid: process.env.BOT_ID,
          },
          params: {
            id: apiId,
          },
        });

        const apiList = apiRequest.data.data;
        statyPing(apiList, {
          state: statsChannel,
          role: role,
          guild: guild,
        });
      } catch (error) {
        try {
          const apiRequest = await StatyAxios.get("/api/all", {
            headers: {
              statyid: process.env.BOT_ID,
            },
            params: {
              guild: guild.id,
            },
          });

          const apiList = apiRequest.data.data;
          let pingArray = [];

          apiList.map((item) => {
            pingArray.push(item.api_name);
          });

          const allThreads = statsChannel.threads.cache;
          await allThreads.map((thread) => {
            if (pingArray.indexOf(thread.name.slice(3)) < 0) {
              try {
                thread.delete();
              } catch (error) {
                logger(`🔴 [new_starter:delete_thread] ${error}`);
              }
            }
          });
        } catch (error) {
          logger(`🔴 [new_starter:delete_old_thread] ${error}`);
        }
      }
    }
  } catch (error) {
    logger(`🔴 [new_starter:get_setup] ${error}`);
  }
};
