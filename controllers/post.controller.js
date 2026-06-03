const Validator = require("fastest-validator");
const v = new Validator();
const { Post, User } = require("../models");
const { response } = require("../helpers/response.formatter");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

module.exports = {
    createPost: async (req, res) => {
        try {
            const { type, content } = req.body;
            const image = req.file ? req.file.filename : null;

            const schema = {
                type: { type: "string", enum: ["public", "private"] },
                content: { type: "string", optional: true },
            };

            const data = {
                type: type,
                content: content,
            };

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate));
            }

            const post = await Post.create({
                user_id: req.user.id,
                type: type,
                content: content,
                image: image
            });

            return res.status(201).json(response(201, "Post created successfully", post));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while creating post"));
        }
    },
    getPosts: async (req, res) => {
        try {
            const { type, limit, page } = req.query;
            const limitNum = limit ? Number(limit) : 10;
            const pageNum = page ? Number(page) : 1;
            const offset = (pageNum - 1) * limitNum;
            
            const whereClause = {};
            if (type) whereClause.type = type;

            const { rows, count } = await Post.findAndCountAll({
                where: whereClause,
                include: [
                    { model: User, attributes: ['id', 'username', 'avatar'] }
                ],
                order: [['createdAt', 'DESC']],
                limit: limitNum,
                offset: offset
            });

            const formatPagination = {
                data: rows,
                limit: limitNum,
                rows: offset + 1 + "-" + (offset + rows.length),
                total: count,
                page: pageNum
            };

            return res.status(200).json(response(200, "Posts retrieved successfully", formatPagination));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while retrieving posts"));
        }
    },
    showPost: async (req, res) => {
        try {
            const { id } = req.params;
            const post = await Post.findByPk(id, {
                include: [
                    { model: User, attributes: ['id', 'username', 'avatar'] }
                ]
            });

            if (!post) {
                return res.status(404).json(response(404, "Error", "Post not found"));
            }

            return res.status(200).json(response(200, 'Success', post));
        } catch (error) {
            return res.status(500).json(response(500, 'Error', error.message));
        }
    },
    updatePost: async (req, res) => {
        try {
            const { id } = req.params;
            const { content, remove_image } = req.body;
            
            const post = await Post.findByPk(id);
            if (!post) {
                return res.status(404).json(response(404, "Error", "Post not found"));
            }

            if (post.user_id !== req.user.id) {
                return res.status(403).json(response(403, "Error", "forbidden access"));
            }

            let newImage = post.getDataValue("image");
            if (req.file) {
                if (newImage) {
                    const filePath = path.join(__dirname, "../uploads", newImage);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
                newImage = req.file.filename;
            } else if (remove_image === "true" || remove_image === true) {
                if (newImage) {
                    const filePath = path.join(__dirname, "../uploads", newImage);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
                newImage = null;
            }

            await Post.update({
                content: content !== undefined ? content : post.content,
                image: newImage
            }, { where: { id } });

            const updatedPost = await Post.findByPk(id);

            return res.status(200).json(response(200, "Post updated successfully", updatedPost));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while updating post"));
        }
    },
    deletePost: async (req, res) => {
        try {
            const { id } = req.params;
            const post = await Post.findByPk(id);

            if (!post) {
                return res.status(404).json(response(404, "Error", "Post not found"));
            }

            if (post.user_id !== req.user.id) {
                return res.status(403).json(response(403, "Error", "forbidden access"));
            }

            if (post.image) {
                const filePath = path.join(__dirname, "../uploads", post.image);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }

            await Post.destroy({ where: { id } });

            return res.status(200).json(response(200, "Post deleted successfully", null));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while deleting post"));
        }
    }
};
