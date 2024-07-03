import { Client } from "discord.js";
import logs from "./logs";
import pickoAxios from "../libs/PickoAxios";
import { picko_worker } from "./worker";
import { DomainModelTypes } from "../types/Domain.types";

export const __picko__init__ = async (client: Client) => {
  // getting all domains to ping
  try {
    const allDomains = await pickoAxios.get("/domains/all");

    allDomains.data.data.map((domain: DomainModelTypes) => {
      logs(null, "picko:init:worker", `sta ${domain._id}`);
      picko_worker(domain);
      logs(null, "picko:init:worker", `end ${domain._id}`);
    });
  } catch (error: any) {
    logs("error", "picko:init:get:domains", error.message || error);
  }
};
