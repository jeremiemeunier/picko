import { Schema, model } from "mongoose";
import { ApiTypes } from "../interfaces/Api.types";

const Api = model<ApiTypes>(
  "Api",
  new Schema<ApiTypes>({
    guild_id: String,
    role: String,
    api_name: String,
    api_adress: String,
    last_ping: Boolean,
    staty_score: Number,
  })
);

export default Api;
