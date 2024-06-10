import {
  EmbedBuilder,
  ChannelType,
  Channel,
  ThreadChannelResolvable,
  Guild,
  Role,
} from "discord.js";
import axios from "axios";
import StatyAxios from "../libs/StatyAxios";
import logs from "./logs";

export const testing = async (
  api: {
    _id: string;
    guild_id: String;
    role: String;
    api_name: String;
    api_adress: String;
  },
  params: {
    state: Channel;
    role: Role;
    guild: Guild;
    wait: number;
  }
) => {
  const { BOT_ID } = process.env;
  const { state, role, wait } = params;
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
            statyid: BOT_ID,
          },
        });

        apiFetchedData = apiCheck.data.data;

        try {
          // now check health of api endpoint
          await axios.get(apiFetchedData.api_adress);

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
                  statyid: BOT_ID,
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
            await StatyAxios.post(
              "/ping",
              {
                name: apiFetchedData.api_name,
                state: false,
                date: now,
                api: apiFetchedData._id,
              },
              {
                headers: {
                  statyid: BOT_ID,
                },
              }
            );
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
