import { Router } from "express";
import { staty } from "../middlewares/staty";
import Config from "../models/Config";
import logs from "../functions/logs";

const route = Router();

route.get("/setup/:id", staty, async (req, res) => {
  const { id } = req.params;

  try {
    const findItem = await Config.findOne({ guild_id: id });

    if (findItem) {
      res.status(200).json({ message: "Item found", data: findItem });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error: any) {
    logs("error", "api:route:config:get", error, id);
  }
});

route.post("/setup", staty, async (req, res) => {
  const { guild, channel, role } = req.body;

  try {
    const newConfig = new Config({
      guild_id: guild,
      role: role,
      channel: channel,
    });
    await newConfig.save();

    res.status(200).json({ message: "New configuration registred" });
  } catch (error: any) {
    logs("error", "api:route:config:post", error, guild);
  }
});

route.put("/setup/:id", staty, async (req, res) => {
  const { id } = req.params;
  const { channel, role } = req.body;

  try {
    const updatedItem = await Config.findOneAndUpdate(
      { guild_id: id },
      {
        role: role,
        channel: channel,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Configuration has updated", data: updatedItem });
  } catch (error: any) {
    logs("error", "api:route:config:put", error, id);
  }
});

export default route;
