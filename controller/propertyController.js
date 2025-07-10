const express = require('express');
const router = express.Router();
const propertyService = require('../services/propertyService');
const { body } = require('express-validator');
const isAuth = require('../middleware/auth');

// validation is pending, for now using only auth middleware
router.get('/', isAuth, propertyService.getAllProperties);
router.get('/:id', isAuth,propertyService.getPropertyById);
router.get('/search', isAuth, propertyService.searchProperties);
router.post('/', propertyService.createProperty);
router.put('/:id', isAuth, propertyService.updateProperty);
router.delete('/:id', isAuth, propertyService.deleteProperty);

module.exports = router;