const express = require("express");
const router = express.Router();
const Ping = require("../models/Ping");
const Api = require("../models/Api");
const staty = require("../middlewares/staty");

const { logger } = require("../functions/logger");

router.post("/ping", staty, async (req, res) => {
  const { name, state, date, guildId, api } = req.body;

  try {
    const newPing = new Ping({
      api_name: name,
      state: state,
      date: date,
      guild: guildId,
      api_id: api,
    });
    await newPing.save();

    res.status(201).json({ message: "New ping registred" });
  } catch (error) {
    logger(`🔴 [api:ping:post] Route error : ${error}`);
    res.status(500).json({ message: "Somethings went wrong" });
  }
});

router.get("/ping/extern", staty, async (req, res) => {
  const { adress, guild, size } = req.query;

  try {
    const apiId = await Api.findOne({ guild_id: guild, api_adress: adress });
    const allPing = await Ping.find({ api_id: apiId._id })
      .sort({ date: "desc" })
      .limit(size || 288);

    res
      .status(200)
      .json({ data: allPing, message: "All ping find for last 24 hours" });
  } catch (error) {
    logger(`🔴 [api:ping:get] Route error : ${error}`);
    res.status(500).json({ message: "Somethings went wrong" });
  }
});

router.get("/ping", staty, async (req, res) => {
  const { id, size } = req.query;

  try {
    const allPing = await Ping.find({ api_id: id })
      .sort({ date: "desc" })
      .limit(size || 288);

    res
      .status(200)
      .json({ data: allPing, message: "All ping find for last 24 hours" });
  } catch (error) {
    logger(`🔴 [api:ping:get] Route error : ${error}`);
    res.status(500).json({ message: "Somethings went wrong" });
  }
});

module.exports = router;
