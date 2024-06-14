import { Schema, model } from "mongoose";
import { ConfigTypes } from "../interfaces/Config.types";

const Config = model<ConfigTypes>(
  "Config",
  new Schema<ConfigTypes>({
    guild_id: String,
    role: String,
    channel: String,
  })
);

export default Config;
