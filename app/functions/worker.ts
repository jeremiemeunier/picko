import { Guild, Role, EmbedBuilder } from "discord.js";
import axios from "axios";
import StatyAxios from "../libs/StatyAxios";
import logs from "./logs";
import { ApiTypes } from "../interfaces/Api.types";

const ping = async (adress: String) => {
  const { BOT_ID } = process.env;

  try {
    await axios.get(adress.toString(), {
      headers: {
        statyping: BOT_ID,
      },
    });
    return { up: true };
  } catch (error: any) {
    return { up: false, failure: error.message };
  }
};

const up_worker = async (
  api: ApiTypes,
  params: {
    state: any;
    role: Role;
    guild: Guild;
    wait: number;
  }
) => {
  const { api_adress, api_name, last_ping, staty_score, _id } = api;

  if (!last_ping) {
    try {
      const embed = new EmbedBuilder()
        .setColor(parseInt("BDC667", 16))
        .setDescription(`${api_adress.toString()}`);

      await params.state.send({
        content: `<@&${params.role}> your api **${api_name}** is now up !`,
        embeds: [embed],
      });
    } catch (error: any) {
      logs("error", "staty:worker:up:work:send:msg", error, params.guild.id);
    }
  }

  // now update last ping and score in database
  try {
    await StatyAxios.put(`/api/ping/${_id}`, {
      state: true,
      score:
        staty_score === undefined ? 0 : parseInt(staty_score.toFixed()) + 1,
    });
  } catch (error: any) {
    logs("error", "staty:worker:up:work:update", error, params.guild.id);
  }
};

const down_worker = async (
  api: ApiTypes,
  params: {
    state: any;
    role: Role;
    guild: Guild;
    wait: number;
  },
  result: { up: boolean; failure?: string }
) => {
  const { api_adress, api_name, last_ping, staty_score, _id } = api;

  if (last_ping) {
    try {
      const embed = new EmbedBuilder()
        .setColor(parseInt("E63B2E", 16))
        .setDescription(
          `${api_adress.toString()}\r\n\`\`\`${result.failure}\`\`\``
        );

      await params.state.send({
        content: `<@&${params.role}> your api **${api_name}** is now down !`,
        embeds: [embed],
      });
    } catch (error: any) {
      logs("error", "staty:worker:down:work:send:msg", error, params.guild.id);
    }
  }

  // now update last ping and score in database
  try {
    await StatyAxios.put(`/api/ping/${_id}`, {
      state: false,
      score:
        staty_score === undefined ? 0 : parseInt(staty_score.toFixed()) - 1,
    });
  } catch (error: any) {
    logs("error", "staty:worker:down:work:update", error, params.guild.id);
  }
};

export const staty_worker = async (
  api: ApiTypes,
  params: {
    state: any;
    role: Role;
    guild: Guild;
    wait: number;
  }
) => {
  const { api_adress } = api;
  const pingResult: { up: boolean; failure?: string } = await ping(api_adress);

  if (pingResult.up) {
    // api is up
    up_worker(api, params);
  } else {
    // api is down
    down_worker(api, params, pingResult);
  }
};
