const Validator = require("fastest-validator");
const v = new Validator();
const { User } = require("../models")
const { response } = require("../helpers/response.formatter");
const passwordHash = require('password-hash')
const { auth_secret } = require('../config/base.config')
const jwt = require('jsonwebtoken')

module.exports = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const schema = {
                email: { type: "email" },
                password: { type: "string", min: 6 }
            }

            const data = {
                email: email,
                password: password
            }

            const validate = v.validate(data, schema);

            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validasi Error", validate))
            }

            const user = await User.findOne({
                where: { email: email }
            })

            if (!user) {
                return res.status(400).json(response(400, "Validasi Error", "Email Not Found. Try Again"))
            }

            const checkPassword = passwordHash.verify(password, user.password)

            if (!checkPassword) {
                return res.status(400).json(response(400, "Validasi Error", "Password InCorrect. Try again"))
            }

            const token = jwt.sign(
                { user_id: user.id, user_email: user.email, user_name: user.name },
                auth_secret,
                { expiresIn: "1d" })

            if (!token) {
                return res.status(400).json(response(400, "Validasi Error", "Login failed"))

            }
            const formatData = {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                token: token
            }

            return res.status(200).json(response(200, "Login Berhasil", formatData))

        } catch (error) {
            return res.status(500).json(response(500, "Error Server", error.message))
        }
    },
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            const schema = {
                name: { type: "string", min: 1, empty: false },
                email: { type: "email" },
                password: { type: "string", min: 6, empty: false }
            }

            const data = {
                name: name,
                email: email,
                password: password
            }

            const validate = v.validate(data, schema);

            if (!validate) {
                return res.status(400).json(response(400, "Validasi Error", validate))
            }

            const user = await User.findOne({
                where: { email: email }
            })

            if (user) {
                return res.status(400).json(response(400, "Validasi Error", "Email Already Exists. Try Again"))
            }

            const hashedPassword = passwordHash.generate(password);

            const newUser = await User.create({
                name: name,
                email: email,
                password: hashedPassword
            });

            return res.status(201).json(response(201, "Register Berhasil"))

        } catch (error) {
            return res.status(500).json(response(500, "Error Server", error.message))
        }
    }
}