const express = require('express');
const router = express.Router();
const Api = require('../models/Api');
const staty = require('../middlewares/staty');

const { logger } = require('../functions/logger');

router.post('/api/add', staty, async (req, res) => {
  const { guild, role, name, adress } = req.body;

  try {
    const newApi = new Api({
      guild_id: guild,
      role: role,
      api_name: name,
      api_adress: adress
    });
    await newApi.save();

    res.status(200).json({ message: "New api added" });
  }
  catch(error) {
    logger(`🔴 [api:add_api:register] ${error}`);
    res.status(400);
  }
});

module.exports = router;