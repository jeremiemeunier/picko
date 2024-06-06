export const staty = async (req: any, res: any, next: () => void) => {
  if (req.headers.statyid === process.env.BOT_ID) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized" });
  }
};
