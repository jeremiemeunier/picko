const { BOT_ID } = require("../config/secret.json");

const staty = async (req, res, next) => {
  if (req.headers.statyid === BOT_ID) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized" });
  }
};

module.exports = staty;
