import { Router } from "express";
import Config, { findOne } from "../models/Config";
import { staty } from "../middlewares/staty";

const router = Router();

import { logger } from "../functions/logger";

router.post("/setup", staty, async (req, res) => {
  const { guild, channel, role } = req.body;

  try {
    const newConfig = new Config({
      guild_id: guild,
      role: role,
      channel: channel,
    });
    await newConfig.save();

    res.status(200).json({ message: "New configuration registred" });
  } catch (error) {
    logger(`🔴 [api:setup:register] ${error}`);
  }
});

router.get("/setup", staty, async (req, res) => {
  const { guild } = req.query;

  try {
    const setup = await findOne({ guild_id: guild });

    if (!setup) {
      res.status(404).json({ message: "No configuration for this guild" });
    } else {
      res.status(200).json({ message: "Configuration find", data: setup });
    }
  } catch (error) {
    logger(`🔴 [api:setup:get] ${error}`);
    res.status(400);
  }
});

export default router;
