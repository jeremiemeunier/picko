import { Router } from "express";
import Ping from "../models/Ping";
import Api from "../models/Api";
import { staty } from "../middlewares/staty";
import logs from "../functions/logs";

const route = Router();

route.get("/ping/extern", staty, async (req, res) => {
  const { adress, guild, size } = req.query;

  try {
    const findItem = await Api.findOne({ guild_id: guild, api_adress: adress });

    if (findItem) {
      try {
        const findItemList = await Ping.find({ api_id: findItem._id })
          .sort({ day: "desc" })
          .limit(typeof size === "number" && size ? size : 90);
        res.status(200).json({
          data: findItemList,
          message: `All ping find for last ${size ? size : 90} days`,
        });
      } catch (error: any) {
        logs("error", "api:route:ping:get:extern", error);
        res.status(500).json({ message: "Somethings went wrong" });
      }
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error: any) {
    logs("error", "api:route:ping:get:extern", error);
    res.status(500).json({ message: "Somethings went wrong" });
  }
});

route.get("/ping/extern/stats", staty, async (req, res) => {
  const { adress, guild, size } = req.query;

  try {
    const findItem = await Api.findOne({ guild_id: guild, api_adress: adress });

    if (findItem) {
      try {
        const findItemList = await Ping.find({ api_id: findItem._id })
          .sort({ day: "desc" })
          .limit(typeof size === "number" && size ? size : 90);

        // making stats directly
        const uptime = [];
        const downtime = [];

        findItemList.map((status) => {
          if (status.pings) {
            status.pings.map((ping) =>
              ping.state ? uptime.push(ping) : downtime.push(ping)
            );
          }
        });

        // response with stats
        res.status(200).json({
          data: {
            uptime: (
              (uptime.length / (downtime.length + uptime.length)) *
              100
            ).toFixed(2),
            downtime: (
              (downtime.length / (downtime.length + uptime.length)) *
              100
            ).toFixed(2),
          },
          message: `All ping find for last ${size ? size : 90} days`,
        });
      } catch (error: any) {
        logs("error", "api:route:ping:get:extern", error);
        res.status(500).json({ message: "Somethings went wrong" });
      }
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error: any) {
    logs("error", "api:route:ping:get:extern", error);
    res.status(500).json({ message: "Somethings went wrong" });
  }
});

route.get("/ping/:id", staty, async (req, res) => {
  const { id } = req.params;
  const { size } = req.query;

  try {
    const findItemList = await Ping.find({ api_id: id })
      .sort({ day: "desc" })
      .limit(typeof size === "number" && size ? size : 90);

    if (findItemList && findItemList.length > 0) {
      res
        .status(200)
        .json({ message: "Find here all pings wanted", data: findItemList });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error: any) {
    logs("error", "api:route:ping:get:id", error);
    res.status(500).json({ message: "Somethings went wrong" });
  }
});

route.post("/ping/:id", staty, async (req, res) => {
  const { id } = req.params;
  const { state, guild_id } = req.body;

  const date = new Date().toString();
  const buildedDate = new Date().toLocaleDateString("fr-FR");

  try {
    const findPingDoc = await Ping.findOne({ api_id: id, day: buildedDate });

    if (findPingDoc) {
      const dailyPings = findPingDoc.pings;
      dailyPings.push({
        state: state,
        date: date,
      });

      try {
        await Ping.updateOne(
          { api_id: id, day: buildedDate },
          { pings: dailyPings }
        );

        res.status(200).json({ message: "Ping saved" });
      } catch (error: any) {
        logs("error", "api:route:ping:post:update", error);
      }
    } else {
      try {
        const newDay = new Ping({
          guild_id: guild_id,
          api_id: id,
          day: buildedDate,
          pings: [
            {
              state: state,
              date: date,
            },
          ],
        });
        await newDay.save();

        res.status(200).json({ message: "Ping saved" });
      } catch (error: any) {
        logs("error", "api:route:ping:post:create", error);
      }
    }
  } catch (error: any) {
    logs("error", "api:route:ping:post", error);
  }
});

export default route;
