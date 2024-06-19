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
      discord_id: { type: String, unique: true },
      avatar: String,
    },
    company: {
      name: String,
      mail: { type: String, unique: true },
      siret: { type: String, unique: true },
      tva: { type: String, unique: true },
    },
    private: {
      token: String,
      salt: String,
      hash: String,
    },
  })
);

export default User;
