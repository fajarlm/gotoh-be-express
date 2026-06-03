const jwt = require('jsonwebtoken')
const {response } = require('../helpers/response.formatter')
const {auth_secret } = require('../config/base.config') 

module.exports = {
    checkToken: async (req, res, next) => {
        let token = req.header('authorization')

        if (!token) {
            return res.status(401).json(response(401, "unauthorized", "Please login and try again"))
        }

        try {
            token = token.replace("Bearer ", "")
            const check = jwt.verify(token, auth_secret)
            req.user = check;

            next();
        } catch (err) {
            return res.status(401).json(response(401, "unauthorized", "Please login and try again"))
        }
    },
    checkAdmin: (req, res, next) => {
        const userRole = req.user?.user_role || req.user?.role;

        if (userRole !== 'admin') {
            return res.status(403).json(response(403, "forbidden", "Admin role required"));
        }

        next();
    },
}