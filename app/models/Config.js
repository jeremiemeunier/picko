const mongoose = require("mongoose");

const config = mongoose.model("Config", {
  guild_id: String,
  role: String,
  channel: String,
});

module.exports = config;
