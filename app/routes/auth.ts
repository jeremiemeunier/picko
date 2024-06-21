import { Router } from "express";
import logs from "../functions/logs";
import DiscordAxios from "../libs/DiscordAxios";
import User from "../models/User";

const route = Router();

route.post("/auth", async (req, res) => {
  const params = new URLSearchParams();
  const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } = process.env;
  const { code, expires_in, refresh_token } = req.body;

  if (DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET) {
    if (process.env.DEV === "1") {
      params.append("client_id", DISCORD_CLIENT_ID);
      params.append("client_secret", DISCORD_CLIENT_SECRET);
      params.append("grant_type", "authorization_code");
      params.append("redirect_uri", "http://localhost:5175/auth");
      params.append("code", code);
    } else {
      params.append("client_id", DISCORD_CLIENT_ID);
      params.append("client_secret", DISCORD_CLIENT_SECRET);
      params.append("grant_type", "authorization_code");
      params.append("redirect_uri", "http://localhost:5175/auth");
      params.append("code", code);
    }

    try {
      const discordToken = await DiscordAxios.post("/oauth2/token", params);
      const { access_token, token_type, refresh_token, expires_in } =
        discordToken.data;

      try {
        const discordAuth = await DiscordAxios.get("/users/@me", {
          headers: {
            Authorization: `${token_type} ${access_token}`,
          },
        });

        try {
          const findUser = await User.findOne({
            "personal.discord_id": discordAuth.data.id,
            "personal.mail": discordAuth.data.email,
          });

          if (findUser) {
            res.status(200).json({
              message: "You are successfully authenticated",
              data: findUser,
            });
          } else {
            const discordGuilds = await DiscordAxios.get("/users/@me/guilds", {
              headers: {
                Authorization: `${token_type} ${access_token}`,
              },
            });

            res.status(200).json({
              message: "You are successfully authenticated",
              data: {
                user: discordAuth.data,
                guilds: discordGuilds.data,
                private: {
                  token: access_token,
                  expires_in: expires_in,
                  type: token_type,
                  refresh_token: refresh_token,
                },
              },
              next: "require_sign",
            });
          }
        } catch (error: any) {
          logs("error", "api:auth:discord:user:find", error);
          res.status(500).json({ message: "An error occured" });
        }
      } catch (error: any) {
        logs("error", "api:auth:discord:user", error);
        res.status(500).json({ message: "An error occured" });
      }
    } catch (error: any) {
      logs("error", "api:auth:discord:token", error);
      res.status(500).json({ message: "An error occured" });
    }
  } else {
    res.status(500).json({ message: "Some parameters are not transmitted" });
  }
});

route.post("/auth/register", async (req, res) => {
  const {
    firstname,
    lastname,
    mail,
    discord_id,
    avatar,
    guilds,
    token,
    refresh_token,
    expires_in,
    type,
  } = req.body;

  try {
    const newUser = new User({
      personal: {
        mail: mail,
        username: "",
        firstname: firstname,
        lastname: lastname,
        discord: {
          id: discord_id,
          guilds: guilds,
        },
        avatar: avatar,
      },
      token: token,
      refresh_token: refresh_token,
      expires_in: expires_in,
      type: type,
    });

    await newUser.save();
    res.status(200).json({ message: "New user are created", data: newUser });
  } catch (error: any) {
    logs("error", "api:route:register:post", error);
    res.status(500).json({ message: "An error occured on register user" });
  }
});

export default route;
