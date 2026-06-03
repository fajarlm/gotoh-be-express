const Validator = require("fastest-validator");
const v = new Validator();
const { User, Community,Community_Members } = require("../models")
const { response } = require("../helpers/response.formatter");
const passwordHash = require('password-hash')
const { auth_secret } = require('../config/base.config')
const jwt = require('jsonwebtoken')
const { Op } = require("sequelize");

module.exports = {
    getCommunityMembers: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, sortBy, order, limit, page } = req.query;
            const offset = Number(page - 1) * Number(limit);
            const { rows, count } = await Community_Members.findAndCountAll({
                where: { community_id: id },
                include: [{
                    model: User,
                    where: name ? {
                        username: { [Op.like]: `%${name}%` }
                    } : {}
                }],
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

            return res.status(200).json(response(200, "Community members retrieved successfully", formatPagination));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while retrieving community members"));
        }
    },
    deleteCommunityMember: async (req, res) => {
        try {
            const { id } = req.params;
            const communityMember = await Community_Members.findOne({
                where: { id }
            });
            if (!communityMember) {
                return res.status(404).json(response(404, "Error", "Community member not found"));
            }
            await communityMember.destroy();
            return res.status(200).json(response(200, "Success", "Community member deleted successfully"));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while deleting community member"));
        }
    }
}
