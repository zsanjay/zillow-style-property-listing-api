const express = require('express');
const router = express.Router();
const v1PropertyRoutes = require('./v1/property');
const v1AuthRoutes = require('./v1/auth');

router.use('/v1', v1PropertyRoutes);
router.use('/v1', v1AuthRoutes);

module.exports = router;