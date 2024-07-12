import axios from "axios";
import logs from "./logs";
import { DomainModelTypes } from "../types/Domain.types";
import pickoAxios from "../libs/PickoAxios";
import { PingResultType } from "../types/PingResult.types";
import {
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

const ping = async (adress: String, _id: String) => {
  const { BOT_ID } = process.env;
  const start = Date.now();

  if (BOT_ID) {
    try {
      await axios.get(adress.toString(), {
        headers: {
          pickoping: `${parseInt(BOT_ID, 8)}_${parseInt(_id.toString(), 10)}`,
        },
      });
      return { up: true, delay: Date.now() - start };
    } catch (error: any) {
      return { up: false, failure: error.message, delay: 0 };
    }
  } else {
    return { up: false, failure: null, delay: 0 };
  }
};

const save_ping = async (
  api: DomainModelTypes,
  result: PingResultType,
  client: Client
) => {
  try {
    await pickoAxios.post(`/pings/automated/${api._id}`, {
      state: result.up,
      error: result?.failure,
      delay: result?.delay,
    });
  } catch (error: any) {
    logs("error", "post:ping", error);
  }
};

const up_worker = async (
  api: DomainModelTypes,
  pingResult: PingResultType,
  client: Client
) => {
  const { adress, name, last_ping, score, _id } = api;
  let updateScore = score;

  if (!last_ping) {
    // last ping indicate api is down and now is up
    if (api.discord) {
      try {
        const guild = client.guilds.cache.find(
          (guild) => guild.id === api.discord.guild
        );

        if (guild) {
          const channel: any = guild.channels.cache.find(
            (channel) => channel.id === api.discord.channel
          );

          if (channel) {
            // send message to discord configured part
            try {
              const embed = new EmbedBuilder()
                .setColor(parseInt("73B255", 16))
                .setTitle("picko monitoring")
                .setDescription(`${adress.toString()}`);
              channel.send({
                embeds: [embed],
                content: `<@&${api.discord.role}> your api **${name}** is now up !`,
              });
            } catch (error: any) {
              logs("error", "up:work:send:msg", error, guild.id);
            }
          }
        }
      } catch (error: any) {
        logs("error", "discord:get:guild", error.message || error);
      }
    }

    try {
      await pickoAxios.post(`/domains/report/${_id}`, {
        state: true,
        delay: pingResult.delay,
      });
    } catch (error: any) {
      logs("error", "worker:report", error.message || error);
    }
  }

  if (score === undefined) {
    updateScore = 0;
  } else if ((score as number) >= 100) {
    updateScore = 100;
  } else {
    updateScore = (score as number) + 1;
  }

  // now update last ping and score in database
  try {
    await pickoAxios.put(`/domains/automated/${_id}`, {
      state: true,
      score: updateScore,
    });
  } catch (error: any) {
    logs("error", "work:up:update", error);
  }
};

const down_worker = async (
  api: DomainModelTypes,
  pingResult: PingResultType,
  client: Client
) => {
  const { adress, name, last_ping, score, _id } = api;
  let updateScore = score;

  if (last_ping) {
    // last ping indicate api is down and now is up

    if (api.discord) {
      try {
        const guild = client.guilds.cache.find(
          (guild) => guild.id === api.discord.guild
        );

        if (guild) {
          const channel: any = guild.channels.cache.find(
            (channel) => channel.id === api.discord.channel
          );

          if (channel) {
            // send message to discord configured part
            try {
              const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder({
                  label: "Report details",
                  style: ButtonStyle.Link,
                  url: `https://picko.tech/dashboard/report/${_id}`,
                })
              );
              const embed = new EmbedBuilder()
                .setColor(parseInt("DF2935", 16))
                .setTitle("picko monitoring")
                .setDescription(`${adress.toString()}`);
              channel.send({
                embeds: [embed],
                components: [button],
                content: `<@&${api.discord.role}> your api **${api.name}** is now down !`,
              });
            } catch (error: any) {
              logs("error", "down:work:send:msg", error, guild.id);
            }
          }
        }
      } catch (error: any) {
        logs("error", "discord:get:guild", error.message || error);
      }
    }

    try {
      await pickoAxios.post(`/domains/report/${_id}`, {
        state: false,
        err: pingResult.failure,
        delay: pingResult.delay,
      });
    } catch (error: any) {
      logs("error", "worker:report", error.message || error);
    }
  }

  if (score === undefined) {
    updateScore = 0;
  } else if ((score as number) <= -100) {
    updateScore = -100;
  } else {
    updateScore = (score as number) - 1;
  }

  // now update last ping and score in database
  try {
    await pickoAxios.put(`/domains/automated/${_id}`, {
      state: false,
      score:
        score === undefined
          ? 0
          : (score as number) > -100
          ? parseInt(score.toFixed()) - 1
          : -100,
    });
  } catch (error: any) {
    logs("error", "work:up:update", error);
  }
};

export const picko_worker = async (api: DomainModelTypes, client: Client) => {
  const { adress } = api;
  const pingResult: PingResultType = await ping(adress, api._id);

  save_ping(api, pingResult, client);

  if (pingResult.up) {
    // api is up
    up_worker(api, pingResult, client);
  } else {
    // api is down
    down_worker(api, pingResult, client);
  }
};
