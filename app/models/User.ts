import { Schema, model } from "mongoose";
import { UserTypes } from "../interfaces/User.types";

const User = model<UserTypes>(
  "User",
  new Schema<UserTypes>({
    personal: {
      mail: { type: String, unique: true },
      username: String,
      firstname: String,
      lastname: String,
      discord: {
        id: { type: String, unique: true },
        guilds: Object,
      },
      avatar: String,
    },
    company: {
      name: String,
      mail: { type: String, unique: true },
      siret: { type: String, unique: true },
      tva: { type: String, unique: true },
    },
    token: String,
    refresh_token: String,
    expires_in: Number,
    type: String,
  })
);

export default User;
