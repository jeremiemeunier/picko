import { Router } from "express";
import logs from "../functions/logs";
import User from "../models/User";
import { staty } from "../middlewares/staty";

const route = Router();

route.get("/me", staty, async (req, res) => {
  const { authorization } = req.headers;

  try {
    const findUser = await User.findById({ _id: authorization?.split(" ")[1] });

    if (findUser) {
      res.status(200).json({ message: "User found", data: findUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    logs("error", "api:route:user:me:get", error);
    res.status(400).json({ message: "You must send a key to identify user" });
  }
});

export default route;
