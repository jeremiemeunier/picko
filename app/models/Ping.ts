import { Schema, model } from "mongoose";
import { PingTypes } from "../interfaces/Ping.types";

const Ping = model<PingTypes>(
  "Ping",
  new Schema<PingTypes>({
    guild_id: String,
    api_id: String,
    day: String,
    pings: Array,
  })
);

export default Ping;
