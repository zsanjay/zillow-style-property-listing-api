const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authService = require('../services/authService');
const User = require('../models/user');

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    const err = new Error("Email address is already exists!");
                    err.statusCode = 422;
                    throw err;
                }
            });
        }),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters.'),
    body('name').trim().not().isEmpty().withMessage('Name is required.')
], authService.signup);

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.'),
        body('password').trim().isLength({ min: 5 })
], authService.login);

module.exports = router;