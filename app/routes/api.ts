import { Router } from "express";
import Api from "../models/Api";
import { staty } from "../middlewares/staty";
import logs from "../functions/logs";

const route = Router();

route.get("/api/:id", staty, async (req, res) => {
  const { id } = req.params;

  // get details of api
  try {
    const findItem = await Api.findById({ _id: id });

    if (findItem) {
      res.status(200).json({ message: "Item found", data: findItem });
    } else {
      res.status(404).json({ message: "Item not found for this id" });
    }
  } catch (error: any) {
    logs("error", "api:route:api:get:id", error);
    res.status(500).json({ message: "An error occured (catch)" });
  }
});

route.get("/api/all/:id", staty, async (req, res) => {
  const { id } = req.params;

  // find all api for a guild
  try {
    const findAllItems = await Api.find({ guild_id: id });

    if (findAllItems && findAllItems.length > 0) {
      res.status(200).json({ message: "Items found", data: findAllItems });
    } else {
      res.status(404).json({ message: "No items found for this guild" });
    }
  } catch (error: any) {
    logs("error", "api:route:api:get:by_guild", error, id);
    res.status(500).json({ message: "An error occured (catch)" });
  }
});

route.post("/api", staty, async (req, res) => {
  const { guild, role, name, adress } = req.body;

  try {
    const newApi = new Api({
      guild_id: guild,
      role: role,
      api_name: name,
      api_adress: adress,
      last_ping: true,
    });
    await newApi.save();

    res.status(200).json({ message: "New api added", data: newApi });
  } catch (error: any) {
    logs("error", "api:register_new", error, guild);
    res.status(500).json({ message: "An error occured (catch)" });
  }
});

route.put("/api/ping/:id", staty, async (req, res) => {
  const { id } = req.params;
  const { score, state } = req.body;

  try {
    const updatedApi = await Api.findByIdAndUpdate(
      { _id: id },
      {
        staty_score: score,
        last_ping: state,
      },
      {
        new: true,
      }
    );

    res.status(200).json({ message: "Api updated", data: updatedApi });
  } catch (error: any) {
    logs("error", "api:update:api", error);
    res.status(500).json({ message: "An error occured (catch)" });
  }
});

route.delete("/api/:id", staty, async (req, res) => {
  const { id } = req.params;

  try {
    await Api.findByIdAndDelete({ _id: id });
    res.status(200).json({ message: "Api removed", data: id });
  } catch (error: any) {
    logs("error", "api:remove", error);
    res.status(500).json({ message: "An error occured (catch)" });
  }
});

export default route;
