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

            const limitNum = limit ? Number(limit) : undefined;
            const pageNum = page ? Number(page) : undefined;
            const offset = (limitNum && pageNum) ? (pageNum - 1) * limitNum : undefined;

            const queryOptions = {
                where: { community_id: id },
                include: [{
                    model: User,
                    where: name ? {
                        username: { [Op.like]: `%${name}%` }
                    } : {}
                }],
                order: sortBy && order ? [[sortBy, order]] : [],
            };

            if (limitNum !== undefined && !isNaN(limitNum)) queryOptions.limit = limitNum;
            if (offset !== undefined && !isNaN(offset)) queryOptions.offset = offset;

            const { rows, count } = await Community_Members.findAndCountAll(queryOptions);

            const formatPagination = {
                data: rows,
                limit: limitNum || count,
                rows: offset !== undefined && !isNaN(offset) 
                    ? (Number(offset + 1) + "-" + (Number(offset) + rows.length)) 
                    : (rows.length > 0 ? `1-${rows.length}` : "0-0"),
                total: count,
                page: pageNum || 1
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
