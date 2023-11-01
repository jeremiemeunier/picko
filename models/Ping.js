const mongoose = require('mongoose');

const ping = mongoose.model("Ping", {
    api_name: String,
    state: Boolean,
    date: String,
});

module.exports = ping