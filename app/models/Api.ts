import { Schema, model } from "mongoose";
import { ApiTypes } from "../interfaces/Api.types";

const Api = model<ApiTypes>(
  "Api",
  new Schema<ApiTypes>({
    guild_id: String,
    role: String,
    api_name: String,
    api_adress: String,
  })
);

export default Api;
