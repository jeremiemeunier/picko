export const staty = async (req: any, res: any, next: () => void) => {
  const { authorization } = req.headers;
  const { BOT_ID } = process.env;

  if (authorization.split(" ")[1] === BOT_ID) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized" });
  }
};
