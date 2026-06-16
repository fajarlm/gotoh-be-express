const Validator = require("fastest-validator");
const v = new Validator();
const { User, Community } = require("../models")
const { response } = require("../helpers/response.formatter");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

module.exports = {
    createCommunity: async (req, res) => {
        try {
            const { name, description, location } = req.body;
            const cover = req.file?.filename;

            const schema = {
                name: { type: "string", min: 3 },
                description: { type: "string", min: 10 },
                cover_image: { type: "string", optional: true },
                location: { type: "string", optional: true },
                created_by: { type: "number" }
            }

            const data = {
                name: name,
                description: description,
                cover_image: cover,
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
                cover_image: cover,
                location: location,
                created_by: req.user.id
            });

            await community.addUser(
                req.user.id,
                {
                    //throught untuk data tambahan seperti role dll
                    through: {
                        role: "admin",
                        joined_at: new Date()
                    }
                }
            );

            return res.status(201).json(response(201, "Community created successfully", community));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while creating community"));
        }
    },
    updateCommunity: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, location } = req.body;
            const cover = req.file?.filename;

            const community = await Community.findByPk(id);
            if (!community) {
                return res.status(404).json(response(404, "Error", "Community not found"));
            }

            const userRole = req.user?.user_role || req.user?.role;
            const userId = req.user?.id || req.user?.user_id;

            if (userRole !== 'admin' && community.created_by !== userId) {
                return res.status(403).json(response(403, "Forbidden", "You do not have permission to update this community"));
            }

            const schema = {
                name: { type: "string", min: 3 ,optional: true},
                description: { type: "string", min: 10, optional: true },
                cover_image: { type: "string", optional: true },
                location: { type: "string", optional: true }
            }

            const data = {
                name: name,
                description: description,
                location: location,
                cover_image: cover
            }
            const validate = v.validate(data, schema);

            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate))
            }

            if (req.file) {
                const imageName = community.getDataValue("cover_image");
                if (imageName) {
                    const filePath = path.join(__dirname, "../uploads", imageName);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
            }

            await Community.update({
                name: name || community.name,
                description: description || community.description,
                location: location || community.location,
                cover_image: (req.file ? req.file.filename : community.getDataValue("cover_image"))
            },
                { where: { id: id } }
            );

            const updatedCommunity = await Community.findByPk(id);

            return res.status(200).json(response(200, "Community updated successfully", updatedCommunity));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "An error occurred while updating community"));
        }
    },
    showCommunity: async (req, res) => {
        try {
            const { id } = req.params;

            const communi = await Community.findByPk(id, {
                include: [{
                    model: User,
                    attributes: ['id', 'username', 'avatar']
                }]
            });
            if (!communi) {
                return res.status(404).json(response(404, 'Error', 'Community not found'));
            }
            const member_count = await communi.countUsers();
            const is_member = req.user ? await communi.hasUser(req.user.id) : false;

            return res.status(200).json(response(200, 'success', {
                ...communi.toJSON(),
                member_count,
                is_member
            }));
        } catch (error) {
            return res.status(500).json(response(500, 'server error', error.message));
        }
    },
    deleteCommunity: async (req, res) => {
        try {
            const { id } = req.params;
            const userRole = req.user?.user_role || req.user?.role;
            const userId = req.user?.id || req.user?.user_id;

            const community = await Community.findByPk(id);
            if (!community) {
                return res.status(404).json(response(404, "Error", "Community not found"));
            }

            if (userRole !== 'admin' && community.created_by !== userId) {
                return res.status(403).json(response(403, "Forbidden", "You do not have permission to delete this community"));
            }

            const coverImage = community.cover_image;
            if (coverImage) {
                const filePath = path.join(__dirname, "../uploads", coverImage);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }

            await community.destroy();

            return res.status(200).json(response(200, "Community deleted successfully", null));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "An error occurred while deleting community"));
        }
    },
    getCommunity: async (req, res) => {
        try {
            const { name, sortBy, order, limit, page } = req.query;
            const limitNum = limit ? Number(limit) : 10;
            const pageNum = page ? Number(page) : 1;
            const offset = (pageNum - 1) * limitNum;

            const { rows, count } = await Community.findAndCountAll({
                include: [{
                    model: User,
                    attributes: ['id', 'username', 'avatar']
                }],
                where: name ? {
                    name: { [Op.like]: `%${name}%` }
                } : {},

                order: sortBy && order ? [[sortBy, order]] : [],
                limit: limitNum,
                offset: offset
            });

            const updatedRows = await Promise.all(rows.map(async (community) => {
                const member_count = await community.countUsers();
                const is_member = req.user ? await community.hasUser(req.user.id) : false;
                return {
                    ...community.toJSON(),
                    member_count,
                    is_member
                };
            }));

            const formatPagination = {
                data: updatedRows,
                limit: limitNum,
                rows: (offset + 1) + "-" + (offset + rows.length),
                total: count,
                page: pageNum
            }

            return res.status(200).json(response(200, "Community retrieved successfully", formatPagination));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "An error occurred while retrieving community"));
        }
    },
    joinCommunity: async (req, res) => {
        try {
            const { id } = req.params;
            const community = await Community.findByPk(id);

            if (!community) {
                return res.status(404).json(response(404, "Error", "Community not found"));
            }

            const is_member = await community.hasUser(req.user.id);
            if (is_member) {
                return res.status(400).json(response(400, "Error", "You have already joined this community"));
            }

            await community.addUser(
                req.user.id,
                {
                    through: {
                        role: "member",
                        joined_at: new Date()
                    }
                }
            );
            return res.status(200).json(response(200, "Success", community));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "An error occurred while joining community"));
        }
    },
    leaveCommunity: async (req, res) => {
        try {
            const { id } = req.params;
            const community = await Community.findByPk(id);

            if (!community) {
                return res.status(404).json(response(404, "Error", "Community not found"));
            }

            const is_member = await community.hasUser(req.user.id);
            if (!is_member) {
                return res.status(400).json(response(400, "Error", "You are not a member of this community"));
            }

            await community.removeUser(req.user.id);

            return res.status(200).json(response(200, "Success", "Left community successfully"));
        } catch (error) {
            console.error(error);
            return res.status(500).json(response(500, "Error", "An error occurred while leaving community"));
        }
    }
}