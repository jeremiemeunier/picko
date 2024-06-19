import express, { json } from "express";
import cors from "cors";
import { connect } from "mongoose";
import { staty } from "../middlewares/staty";

// route importer
import { default as pingRoute } from "../routes/ping";
import { default as configRoute } from "../routes/config";
import { default as apiRoute } from "../routes/api";
import { default as authRoute } from "../routes/auth";
import logs from "./logs";

const app = express();
const { MONGODB_URL } = process.env;

const api = () => {
  app.use(json());
  app.use(cors());

  // BDD
  if (MONGODB_URL) {
    try {
      connect(MONGODB_URL);
      logs("start", "api:database:connect", "Connected to database");
    } catch (error: any) {
      logs("error", "api:database:connect", error);
    }

    try {
      // API
      app.use(pingRoute, staty);
      app.use(configRoute, staty);
      app.use(apiRoute, staty);
      app.use(authRoute);

      app.get("/", (req, res) => {
        res.status(200).json({ message: "Bienvenue sur le backend de Staty" });
      });

      // Route 404
      app.all("*", (req, res) => {
        res.status(404).json({ message: "This route do not exist" });
      });

      app.listen(3000, () => {
        logs("start", "api:binding", "Successfully bind on port 3000");
      });
    } catch (error: any) {
      logs("error", "api", error);
    }
  }
};

export default api;
