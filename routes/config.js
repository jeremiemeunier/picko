const express = require("express");
const router = express.Router();
const Config = require("../models/Config");
const staty = require("../middlewares/staty");

const { logger } = require("../functions/logger");

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
    const setup = await Config.findOne({ guild_id: guild });

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

module.exports = router;
