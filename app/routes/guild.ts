import { Router } from "express";
import { staty } from "../middlewares/staty";
import logs from "../functions/logs";
import { Client } from "discord.js";

const route = Router();

// route.get("/guild/role/:id", staty, async (req, res) => {
//   const { id } = req.params;
//   const params = new URLSearchParams();
//   const { BOT_TOKEN } = process.env;
//   const client = new Client({
//     intents: [],
//     partials: [],
//   });

//   client.once(Events.ClientReady, () => {
//     boot();
//   });
//   client.login(process.env.BOT_TOKEN);
// });

export default route;
