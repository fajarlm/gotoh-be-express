const Validator = require("fastest-validator");
const v = new Validator();
const { User, Community } = require("../models")
const { response } = require("../helpers/response.formatter");
const passwordHash = require('password-hash')
const { auth_secret } = require('../config/base.config')
const jwt = require('jsonwebtoken')
const { Op } = require("sequelize");

module.exports = {
    createCommunity: async (req, res) => {
        try {
            const { name, description, type, category, location } = req.body;
            const schema = {
                name: { type: "string", min: 3 },
                description: { type: "string", min: 10 },
                type: { type: "string", enum: ["public", "private"] },
                category: { type: "string" },
                location: { type: "string" },
                created_by: { type: "number" }
            }

            const data = {
                name: name,
                description: description,
                type: type,
                category: category,
                location: location,
                created_by: req.user.id
            }
            const validate = v.validate(data, schema);

            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate))
            }


            const community = await Community.create({
                name: name,
                description: description,
                type: type,
                category: category,
                location: location,
                created_by: req.user.id
            });

            return res.status(201).json(response(201, "Community created successfully", community));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while creating community"));
        }
    },
    updateCommunity: async (req, res) => {
        try {
            const { id } = req.params;

            const { name, description, type, category, location } = req.body;
            const schema = {
                name: { type: "string", min: 3 },
                description: { type: "string", min: 10 },
                type: { type: "string", enum: ["public", "private"] },
                category: { type: "string" },
                location: { type: "string" }
            }

            const data = {
                name: name,
                description: description,
                type: type,
                category: category,
                location: location,
            }
            const validate = v.validate(data, schema);

            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate))
            }

            const community = await Community.update({
                name: name,
                description: description,
                type: type,
                category: category,
                location: location
            },
                { where: { id: id } }
            );

            const updatedCommunity = await Community.findByPk(id);

            return res.status(200).json(response(200, "Community updated successfully", updatedCommunity));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while updating community"));
        }
    },
    showCommunity: async (req, res) => {
        try {
            // req.params untuk mengambil parameter routes, pada route bagian yang ada titik dua (:)
            const { id } = req.params;

            const item = await Community.findByPk(id);
            return res.status(200).json(response(200, 'success', item));
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    },
    deleteCommunity: async (req, res) => {
        try {
            const { id } = req.params;
            const community = await Community.destroy({
                where: { id: id }
            });

            return res.status(200).json(response(200, "Community deleted successfully", community));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while deleting community"));
        }
    },
    getCommunity: async (req, res) => {
        try {
            const { name, sortBy, order, limit, page } = req.query;
            const offset = Number(page - 1) * Number(limit);
            const { rows, count } = await Community.findAndCountAll({
                include: [{
                    model: User,
                    attributes: [ 'name']
                }],
                where: name ? {
                    name: { [Op.like]: `%${name}%` }
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

            return res.status(200).json(response(200, "Community retrieved successfully", formatPagination));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while retrieving community"));
        }
    }
}