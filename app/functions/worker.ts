import axios from "axios";
import logs from "./logs";
import { DomainModelTypes } from "../types/Domain.types";
import pickoAxios from "../libs/PickoAxios";
import { PingResultType } from "../types/PingResult.types";
import { EmbedBuilder } from "discord.js";

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
      return { up: false, failure: error.message, delay: Date.now() - start };
    }
  } else {
    return { up: false, failure: null, delay: 0 };
  }
};

const save_ping = async (api: DomainModelTypes, result: PingResultType) => {
  try {
    await pickoAxios.post(`/pings/automated/${api._id}`, {
      state: result.up,
      error: result?.failure,
      delay: result?.delay,
    });
  } catch (error: any) {
    logs("error", "save:ping:axios:request", error);
  }
};

const up_worker = async (api: DomainModelTypes, pingResult: PingResultType) => {
  const { adress, name, last_ping, score, _id } = api;

  if (!last_ping) {
    // last ping indicate api is down and now is up

    if (api.discord) {
      // send message to discord configured part
      // try {
      //   const embed = new EmbedBuilder()
      //     .setColor(parseInt("BDC667", 16))
      //     .setDescription(`${adress.toString()}`);
      // } catch (error: any) {
      //   logs("error", "staty:worker:up:work:send:msg", error, api.discord.guild.id);
      // }
    }

    try {
      await pickoAxios.post(`/domains/report/${_id}`, {
        state: true,
        delay: pingResult.delay,
      });
    } catch (error: any) {
      logs("error", "picko:worker:report", error.message || error);
    }
  }

  // now update last ping and score in database
  try {
    await pickoAxios.put(`/domains/automated/${_id}`, {
      state: true,
      score: score === undefined ? 0 : parseInt(score.toFixed()) + 1,
    });
  } catch (error: any) {
    logs("error", "picko:work:up:update", error);
  }
};

const down_worker = async (
  api: DomainModelTypes,
  pingResult: PingResultType
) => {
  const { adress, name, last_ping, score, _id } = api;

  if (last_ping) {
    // last ping indicate api is down and now is up

    if (api.discord) {
      // send message to discord configured part
      // try {
      //   const embed = new EmbedBuilder()
      //     .setColor(parseInt("BDC667", 16))
      //     .setDescription(`${adress.toString()}`);
      // } catch (error: any) {
      //   logs("error", "staty:worker:up:work:send:msg", error, api.discord.guild.id);
      // }
    }

    try {
      await pickoAxios.post(`/domains/report/${_id}`, {
        state: false,
        err: pingResult.failure,
        delay: pingResult.delay,
      });
    } catch (error: any) {
      logs("error", "picko:worker:report", error.message || error);
    }
  }

  // now update last ping and score in database
  try {
    await pickoAxios.put(`/domains/automated/${_id}`, {
      state: false,
      score: score === undefined ? 0 : parseInt(score.toFixed()) - 1,
    });
  } catch (error: any) {
    logs("error", "picko:work:up:update", error);
  }
};

export const picko_worker = async (api: DomainModelTypes) => {
  const { adress } = api;
  const pingResult: PingResultType = await ping(adress, api._id);
  logs(null, "picko:init:worker", `sta ${api._id}`);

  save_ping(api, pingResult);

  if (pingResult.up) {
    // api is up
    up_worker(api, pingResult);
  } else {
    // api is down
    down_worker(api, pingResult);
  }

  logs(null, "picko:init:worker", `end ${api._id}`);
};
