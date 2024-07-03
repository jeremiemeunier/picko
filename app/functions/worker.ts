import axios from "axios";
import logs from "./logs";
import { DomainModelTypes } from "../types/Domain.types";
import pickoAxios from "../libs/PickoAxios";

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

const save_ping = async (
  api: DomainModelTypes,
  result: { up: boolean; failure?: string; delay?: number }
) => {
  try {
    await pickoAxios.post(`/pings/${api._id}`, {
      state: result.up,
      error: result?.failure,
      delay: result?.delay,
    });
  } catch (error: any) {
    logs("error", "save:ping:axios:request", error);
  }
};

export const picko_worker = async (api: DomainModelTypes) => {
  const { adress } = api;
  const pingResult: { up: boolean; failure?: string; delay?: number } =
    await ping(adress, api._id);

  save_ping(api, pingResult);

  // if (pingResult.up) {
  //   // api is up
  //   up_worker(api);
  // } else {
  //   // api is down
  //   down_worker(api, pingResult);
  // }
};
