const express = require("express");
const app = express();
const RateLimit = require('express-rate-limit');
const cors = require("cors");
const mongoose = require("mongoose");

const { PORT, MONGODB_URL } = require('../config/secret.json');

const { logger } = require('../functions/logger');

const api = () => {
    const limiter = RateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    });

    app.use(limiter);
    app.use(express.json());
    app.use(cors());

    // BDD

    try {
        mongoose.connect(MONGODB_URL);
    }
    catch(error) { logger(`🔴 | Database connect : ${error}`); }

    try {
        // API
        const pingRoute = require('../routes/ping');

        app.use(pingRoute);

        app.get("/", (req, res) => {
            res.status(200).json({ message: "Bienvenue sur le backend de Staty" });
        });

        // Route 404
        app.all("*", (req, res) => {
            res.status(404).json({ message: "This route do not exist" });
        });
        
        app.listen(PORT, () => {
            logger(`🚀 | API Server : Started on port ${PORT}`);
        });
    }
    catch(error) {
        logger(`🔴 | API Server : An error occured on api : ${error}`);
    }
}

module.exports = { api }