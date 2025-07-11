const express = require('express');
const router = express.Router();
const propertyService = require('../services/propertyService');
const isAuth = require('../middleware/auth');
const { body } = require('express-validator');
const authorize = require('../middleware/authorize');

router.get('/', propertyService.getAllProperties);
router.get('/search', propertyService.searchProperties);
router.get('/:id', propertyService.getPropertyById);
router.post('/', [
    body('title').trim().not().isEmpty().withMessage('Title is required'),
    body('address').trim().not().isEmpty().withMessage('Address is required'),
    body('price').isNumeric().withMessage('Price must be a number')
] , isAuth, propertyService.createProperty);
router.put('/:id', isAuth, propertyService.updateProperty);
router.delete('/:id', authorize('admin'), isAuth, propertyService.deleteProperty);

module.exports = router;