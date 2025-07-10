const express = require('express');
const router = express.Router();
const propertyController = require('../../controller/propertyController');

router.use('/properties', propertyController);

module.exports = router;