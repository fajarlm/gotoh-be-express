const Validator = require("fastest-validator");
const v = new Validator();
const { User } = require("../models")
const { response } = require("../helpers/response.formatter");
const passwordHash = require('password-hash')
const { auth_secret } = require('../config/base.config')
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

module.exports = {
    getUsers: async (req, res) => {
        try {
            const { username, email, sortBy, order, limit, page } = req.query;
            const currentPage = Number(page) || 1;
            const perPage = Number(limit) || 10;
            const offset = (currentPage - 1) * perPage;

            // const where = {};
            // if (username) {
            //     where.username = {
            //         [Op.like]: `%${username}%`
            //     };
            // }
            // if (email) {
            //     where.email = {
            //         [Op.like]: `%${email}%`
            //     };
            // }

            const { rows, count } = await User.findAndCountAll({
                // where,
                where: username || email ? {
                    [Op.or]: [
                        username ? {
                            username: {
                                [Op.like]: `%${username}%`
                            }
                        } : {},
                        email ? {
                            email: {
                                [Op.like]: `%${email}%`
                            }
                        } : {}
                    ]
                } : {},
                order: sortBy && order ? [[sortBy, order]] : [],
                limit: perPage,
                offset
            });

            // const { rows, count } = await User.findAndCountAll({
            //     // where: username || email ? {
            //     //     [Op.or]: [
            //     //         { username: { [Op.like]: `%${username}%` } },
            //     //         { email: { [Op.like]: `%${email}%` } }
            //     //     ]
            //     // } : {},
            //     where: email ? {
            //         email: { [Op.like]: `%${email}%` }
            //     } : {},

            //     order: sortBy && order ? [[sortBy, order]] : [],
            //     limit: Number(limit),
            //     offset: Number(offset)
            // });

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
            const user = await User.findOne({
                where: { id: req.user.user_id }
            });

            if (!user) {
                return res.status(404).json(response(404, "Error", "User not found"));
            }

            return res.status(200).json(response(200, "Success", user));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while fetching user profile"));
        }
    },
    updateProfile: async (req, res) => {
        try {
            const { username, email, password, health_target } = req.body;
            const avatar = req.file?.filename;

            const user = await User.findByPk(req.user.id);

            if (!user) {
                return res.status(404).json(response(404, "Error", "User not found"))
            }

            const schema = {
                username: { type: "string", min: 3, optional: true },
                email: { type: "email", optional: true },
                password: { type: "string", min: 6, optional: true },
                health_target: { type: "enum", values: ['menurunkan_berat_badan', 'gaya_hidup_sehat', 'membangun_otot'], optional: true },
            }

            const data = {
                username: username,
                email: email,
                password: password,
                health_target: health_target
            }

            if (req.file) {
                const imageName = user.getDataValue("avatar");
                if (imageName) {
                    const filePath = path.join(__dirname, "../uploads", imageName);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
            }

            const validate = v.validate(data, schema);

            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate))
            }

            const updateData = {
                avatar: (req.file ? req.file.filename : user.getDataValue("avatar")),
                username: username || user.getDataValue("username"),
                email: email || user.getDataValue("email"),
                password: password ? passwordHash.generate(password) : user.getDataValue("password"),
                health_target: health_target || user.getDataValue("health_target")
            };

            await User.update(updateData, { where: { id: user.id } });

            const updatedUser = await User.findByPk(user.id);

            return res.status(200).json(response(200, "Success", updatedUser))

        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while updating user profile"))
        }
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
    },
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json(response(404, "Error", "User not found"))
            }
            await User.destroy({ where: { id } });
            return res.status(200).json(response(200, "Success", "User deleted successfully"))
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while deleting user"))
        }
    }
}