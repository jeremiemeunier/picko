const express = require('express');
const router = express.Router();
const Ping = require('../models/Config');
const staty = require('../middlewares/staty');

const { logger } = require('../functions/logger');



module.exports = router;