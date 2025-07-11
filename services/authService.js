const { validationResult } = require('express-validator');

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const email = req.body.email;
        const name = req.body.name;
        const password = req.body.password;
        const role = req.body.role || 'user';
        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPw,
            name: name,
            role: role
        });

        const result = await user.save();
        res.status(201).json({ message: 'User created!', userId: result._id });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                message: 'A user with this email could not be found.'
            });
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            return res.status(401).json({
                message: 'Wrong password!'
            });
        }

        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString(),
                role: user.role || 'user'
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({ token: token, userId: user._id.toString() });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}