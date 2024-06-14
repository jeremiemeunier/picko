import logs from "../functions/logs";

export const staty = async (req: any, res: any, next: () => void) => {
  const { authorization } = req.headers;
  const { BOT_ID } = process.env;

  try {
    if (authorization.split(" ")[1] === BOT_ID) {
      next();
    } else {
      res.status(403).json({ message: "Not authorized" });
    }
  } catch (error: any) {
    logs("error", "middleware", error);
  }
};
