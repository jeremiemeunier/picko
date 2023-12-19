const mongoose = require('mongoose');

const ping = mongoose.model("Ping", {
    api_name: String,
    state: Boolean,
    date: String,
    guild: String,
    api_id: String
});

module.exports = ping