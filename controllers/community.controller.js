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
                name: name,
                description: description,
                location: location,
                cover_image: (req.file ? req.file.filename : community.getDataValue("cover_image"))
            },
                { where: { id: id } }
            );

            const updatedCommunity = await Community.findByPk(id);

            return res.status(201).json(response(201, "Community updated successfully", updatedCommunity));
        } catch (error) {
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
            const community = await Community.destroy({
                where: { id: id }
            });

            return res.status(204).json(response(204, "Community deleted successfully", community));
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
                    attributes: ['id', 'username', 'avatar']
                }],
                where: name ? {
                    name: { [Op.like]: `%${name}%` }
                } : {},

                order: sortBy && order ? [[sortBy, order]] : [],
                limit: Number(limit),
                offset: Number(offset)
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
                limit: limit,
                rows: Number(offset + 1) + "-" + (Number(offset) + rows.length),
                total: count,
                page: page
            }

            return res.status(200).json(response(200, "Community retrieved successfully", formatPagination));
        } catch (error) {
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

            await community.removeUser(req.user.id);

            return res.status(204).json(response(204, "Success", "Left community successfully"));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while leaving community"));
        }
    }
}