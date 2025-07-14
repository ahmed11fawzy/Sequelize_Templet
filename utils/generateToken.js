const jwt = require('jsonwebtoken');

module.exports =async (user) => {
    return await jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
} 