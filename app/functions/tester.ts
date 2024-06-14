import {
  Channel,
  ThreadChannelResolvable,
  Guild,
  Role,
  EmbedBuilder,
} from "discord.js";
import axios from "axios";
import StatyAxios from "../libs/StatyAxios";
import logs from "./logs";

export const restart: (props: any) => void = async ({ api, guild }) => {
  try {
    const setup = await StatyAxios.get(`/setup/${guild.id}`);
    const statsChannel: any = guild.channels.cache.find(
      (statsChannel: any) => statsChannel.id === setup.data.data.channel
    );

    testing(api, {
      state: statsChannel,
      role: setup.data.data.role,
      guild: guild,
      wait: setup.data.data?.wait,
    });
  } catch (error: any) {
    logs("error", "command:tester", error, guild.id);
  }
};

export const testing = async (
  api: {
    _id: string;
    guild_id: String;
    role: String;
    api_name: String;
    api_adress: String;
  },
  params: {
    state: any;
    role: Role;
    guild: Guild;
    wait: number;
  }
) => {
  const { BOT_ID } = process.env;
  const { wait } = params;
  const waitingTime = wait >= 300000 ? wait : 300000;

  try {
    // on error create a thread to details error and ping user
    // on start and success nothings

    let lastApiState: number = 0;
    let threadPing: ThreadChannelResolvable;
    let apiFetchedData: any;

    const pingInterval = setInterval(async () => {
      const now = new Date();

      try {
        // check if this api has removed from watching
        const apiCheck = await StatyAxios.get(`/api/${api._id}`, {
          headers: {
            Authorization: `Bearer ${BOT_ID}`,
          },
        });

        apiFetchedData = apiCheck.data.data;

        try {
          // now check health of api endpoint
          await axios.get(apiFetchedData.api_adress);

          if (lastApiState < 0) {
            lastApiState = 0;
          } else {
            lastApiState = lastApiState + 1;
          }

          if (lastApiState === 0) {
            try {
              const embed = new EmbedBuilder()
                .setColor(parseInt("FFEC51", 16))
                .setDescription(apiFetchedData.api_adress);

              await params.state.send({
                content: `<@&${params.role}> your api is now up !`,
                embeds: [embed],
              });
            } catch (error: any) {
              logs("error", "ping:send_message", error, params.guild.id);
            }
          }

          // api respond with an success code
          // register the ping to indicate an up api
          try {
            await StatyAxios.post(
              `/ping/${api._id}`,
              {
                state: true,
                date: now,
                guild_id: params.guild.id,
              },
              {
                headers: {
                  Authorization: `Bearer ${BOT_ID}`,
                },
              }
            );
          } catch (error: any) {
            logs("error", "ping:database_register", error, params.guild.id);
          }
        } catch (error) {
          // api respond with an error code
          // register the ping to indicate a down api
          try {
            await StatyAxios.post(`/ping/${apiFetchedData._id}`, {
              guild_id: params.guild.id,
              state: false,
            });

            if (lastApiState > -1) {
              lastApiState = -1;
            } else {
              lastApiState = lastApiState - 1;
            }

            if (lastApiState === -1) {
              try {
                const embed = new EmbedBuilder()
                  .setColor(parseInt("FFEC51", 16))
                  .setDescription(apiFetchedData.api_adress);

                await params.state.send({
                  content: `<@&${params.role}> your api is down !`,
                  embeds: [embed],
                });
              } catch (error: any) {
                logs("error", "ping:send_message", error, params.guild.id);
              }
            }
          } catch (error: any) {
            logs("error", "database:register", error);
          }
        }
      } catch (error: any) {
        // this api has removed from watching
        logs("error", "ping:inactive:ping", error);
        clearInterval(pingInterval);
      }
    }, waitingTime);
  } catch (error: any) {
    logs("error", "ping", error);
  }
};
