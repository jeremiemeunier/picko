export const staty = async (req, res, next) => {
  if (req.headers.statyid === process.env.BOT_ID) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized" });
  }
};
