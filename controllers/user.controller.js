const Validator = require("fastest-validator");
const v = new Validator();
const { User } = require("../models")
const { response } = require("../helpers/response.formatter");
const passwordHash = require('password-hash')
const { auth_secret } = require('../config/base.config')
const jwt = require('jsonwebtoken');
const { get } = require("../routes/auth.routes");
const { Op } = require("sequelize");

module.exports = {
    getUsers: async (req, res) => {
        try {
            const { name,email, sortBy, order, limit, page } = req.query;
            const offset = Number(page - 1) * Number(limit);
            const { rows, count } = await User.findAndCountAll({
                where: name || email ? {
                    [Op.or]: [
                        { name: { [Op.like]: `%${name}%` } },
                        { email: { [Op.like]: `%${email}%` } }
                    ]
                } : {},

                order: sortBy && order ? [[sortBy, order]] : [],
                limit: Number(limit),
                offset: Number(offset)
            });

            const formatPagination = {
                data: rows,
                limit: limit,
                rows: Number(offset + 1) + "-" + (Number(offset) + rows.length),
                total: count,
                page: page
            }
            return res.status(200).json(response(200, "Users retrieved successfully", formatPagination));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while retrieving users"));
        }
    },
    getProfile: async (req, res) => {
        try {
            const { avatar, name, email, password } = req.body;

            const user = await User.findOne({
                where: { id: req.user.user_id }
            })
            if (!user) {
                return res.status(404).json(response(404, "Error", "User not found"))
            }
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while fetching user profile"))
        }
        return res.status(200).json(response(200, "Success", user))
    },
    updateProfile: async (req, res) => {
        try {
            const { avatar, name, email, password } = req.body;

            const user = await req.user.id;

            if (!user) {
                return res.status(404).json(response(404, "Error", "User not found"))
            }
            schema = {
                avatar: { type: "string", empty: false },
                name: { type: "string", min: 3, empty: false },
                email: { type: "email", empty: false },
                password: { type: "string", min: 6, empty: false }
            }
            const data = {
                avatar: avatar,
                name: name,
                email: email,
                password: password
            }
            
            const validate = v.validate(data, schema);

            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate))
            }
            const updateData = {
                avatar: avatar,
                name: name,
                email: email,
                password: passwordHash.generate(password)
            };

        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while updating user profile"))
        }
        return res.status(200).json(response(200, "Success", user))
    },
    getProfileHealth: async (req, res) => {
        try {
            const { weight, height, health_target } = req.body;

            const schema = {
                weight: { type: "number", positive: true, integer: false },
                height: { type: "number", positive: true, integer: false },
                health_target: { type: "enum", values: ["menurunkan_berat_badan", "gaya_hidup_sehat", "membangun_otot"] }
            }

            const data = {
                weight: weight,
                height: height,
                health_target: health_target
            }

            const validate = v.validate(data, schema);

            if (!validate) {
                return res.status(400).json(response(400, "Validasi Error", validate))
            }

            const user = await User.findOne({
                where: { id: req.user.user_id }
            })
            if (!user) {
                return res.status(404).json(response(404, "Error", "User not found"))
            }
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while fetching user profile"))
        }
        return res.status(200).json(response(200, "Success", user))
    },
    showUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json(response(404, "Error", "User not found"))
            }
            return res.status(200).json(response(200, "Success", user))
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while fetching user"))
        }
    }
}