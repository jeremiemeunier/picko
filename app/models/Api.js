const mongoose = require("mongoose");

const api = mongoose.model("Api", {
  guild_id: String,
  role: String,
  api_name: String,
  api_adress: String,
});

module.exports = api;
