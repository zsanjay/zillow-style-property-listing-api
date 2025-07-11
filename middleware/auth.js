const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        return res.status(401).json({
            message: 'Not authenticated'
        });
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        error.statusCode = 500;
        next(error);
    }

    if (!decodedToken) {
        return res.status(401).json({
            message: 'Not authenticated'
        });
    }

    req.userId = decodedToken.userId;
    req.userRole = decodedToken.role;
    next();
};