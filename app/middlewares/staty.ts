export const staty = async (
  req: { headers: { statyid: string | undefined } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { message: string }): void; new (): any };
    };
  },
  next: () => void
) => {
  if (req.headers.statyid === process.env.BOT_ID) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized" });
  }
};
