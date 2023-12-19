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

    res.status(200).json({ message: "New api added", data: newApi });
  }
  catch(error) {
    logger(`🔴 [api:add_api:register] ${error}`);
    res.status(400);
  }
});

router.get('/api/all', staty, async (req, res) => {
  const { guild } = req.query;

  try {
    const allApi = await Api.find({ guild_id: guild });

    if(!allApi) {
      res.status(404).json({ message: "No api find for this guild" });
    }
    else {
      res.status(200).json({ message: "Api find", data: allApi });
    }
  }
  catch(error) {
    logger(`🔴 [api:add_api:get_all] ${error}`);
    res.status(400);
  }
});

router.get('/api/id/', staty, async (req, res) => {
  const { id } = req.query;
  try {
    const allApi = await Api.findById({ _id: id });

    if(!allApi) {
      res.status(404).json({ message: "No api find for this guild" });
    }
    else {
      res.status(200).json({ message: "Api find", data: allApi });
    }
  }
  catch(error) {
    logger(`🔴 [api:add_api:get_all] ${error}`);
    res.status(400);
  }
});

router.delete('/api/remove', staty, async (req, res) => {
  const { id } = req.query;

  try {
    await Api.findByIdAndRemove({ _id: id });
    res.status(200).json({ message: "Api removed", data: id });
  }
  catch(error) {
    logger(`🔴 [api:add_api:remove] ${error}`);
    res.status(400);
  }
});

module.exports = router;