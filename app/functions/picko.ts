import { Client } from "discord.js";
import logs from "./logs";
import pickoAxios from "../libs/PickoAxios";
import { picko_worker } from "./worker";
import { DomainModelTypes } from "../types/Domain.types";

export const __picko__init__ = async (client: Client) => {
  // getting all domains to ping
  try {
    const allDomains = await pickoAxios.get("/domains/automated");

    allDomains.data.map(async (domain: DomainModelTypes) => {
      picko_worker(domain);
    });
  } catch (error: any) {
    logs("error", "picko:init:get:domains", error.message || error);
  }
};
