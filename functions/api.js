import express, { json } from "express";
import cors from "cors";
import { connect } from "mongoose";
import { logger } from "../functions/logger";
import { staty } from "../middlewares/staty";

const app = express();

// route importer
import pingRoute from "../routes/ping";
import configRoute from "../routes/config";
import apiRoute from "../routes/api";

export const api = () => {
  app.use(json());
  app.use(cors());

  // BDD
  try {
    connect(process.env.MONGODB_URL);
  } catch (error) {
    logger(`🔴 [api:database] Database connect : ${error}`);
  }

  try {
    // API
    app.use(pingRoute, staty);
    app.use(configRoute, staty);
    app.use(apiRoute, staty);

    app.get("/", (req, res) => {
      res.status(200).json({ message: "Bienvenue sur le backend de Staty" });
    });

    // Route 404
    app.all("*", (req, res) => {
      res.status(404).json({ message: "This route do not exist" });
    });

    app.listen(process.env.DEV === "1" ? 4000 : 3000, () => {
      logger(`🚀 [api:server:launch] Started on port 3000`);
    });
  } catch (error) {
    logger(`🔴 [api:server] An error occured on api : ${error}`);
  }
};
