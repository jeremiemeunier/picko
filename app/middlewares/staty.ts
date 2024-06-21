import logs from "../functions/logs";
import User from "../models/User";

export const staty = async (req: any, res: any, next: () => void) => {
  const { authorization } = req.headers;
  const { BOT_ID } = process.env;
  const key = authorization.split(" ")[1];

  if (key) {
    try {
      if (key === BOT_ID) {
        next();
      } else {
        try {
          const findUser = await User.findById({
            _id: key,
          });

          if (findUser) {
            next();
          } else {
            res.status(403).json({ message: "Not authorized for this user" });
          }
        } catch (error: any) {
          logs("error", "middleware:find:user", error);
          logs("error", "middleware:requested_from", req.hostname);
          res.status(500).json({ message: "An error occured on middleware" });
        }
      }
    } catch (error: any) {
      logs("error", "middleware", error);
      logs("error", "middleware:requested_from", req.hostname);
      res.status(403).json({ message: "Not authorized" });
    }
  } else {
    res.status(400).json({ message: "You must indicate a key in headers" });
  }
};
