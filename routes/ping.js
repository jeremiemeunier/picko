const express = require('express');
const router = express.Router();
const Ping = require('../models/Ping');
const staty = require('../middlewares/staty');

const { logger } = require('../functions/logger');

router.post('/ping', staty, async (req, res) => {
    const { name, state, date } = req.body;

    try {
        const newPing = new Ping({
            api_name: name,
            state: state,
            date: date
        });
        await newPing.save();

        res.status(201).json({ message: 'New ping registred' });
    }
    catch(error) { logger(`🔴 | Route error : ${error}`); }
});

router.get('/ping', staty, async (req, res) => {
    const { api_name } = req.query;

    try {
        const allPing = await Ping.find({ api_name: api_name }).sort({date: 'asc'}).limit(288);

        res.status(200).json({ data: allPing, message: 'All ping find for last 24 hours' });
    }
    catch(error) { logger(`🔴 | Route error : ${error}`); }
});

module.exports = router;