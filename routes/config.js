const express = require('express');
const router = express.Router();
const Config = require('../models/Config');
const staty = require('../middlewares/staty');

const { logger } = require('../functions/logger');

router.post('/setup', staty, async (req, res) => {
  const { guild, channel, role } = req.body;

  try {
    const newConfig = new Config({
      guild_id: guild,
      role: role,
      channel: channel
    });
    await newConfig.save();

    res.status(200).json({ message: "New configuration registred" });
  }
  catch(error) { logger(`🔴 [api:setup:register] ${error}`); }
});

module.exports = router;