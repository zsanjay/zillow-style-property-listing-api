const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authService = require('../services/authService');
const User = require('../models/user');

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    Promise.reject('Email address is already exists!');
                }
            });
        }),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
], authService.signup);

router.post('/login', authService.login);

module.exports = router;