const Validator = require("fastest-validator");
const v = new Validator();
const { Comment, User, Post } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
    createComment: async (req, res) => {
        try {
            const { post_id, content } = req.body;

            const schema = {
                post_id: { type: "number", positive: true, integer: true },
                content: { type: "string", min: 1 },
            };

            const data = {
                post_id: Number(post_id),
                content: content,
            };

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate));
            }

            const post = await Post.findByPk(post_id);
            if (!post) {
                return res.status(404).json(response(404, "Error", "Post not found"));
            }

            const comment = await Comment.create({
                user_id: req.user.id,
                post_id: post_id,
                content: content
            });

            return res.status(201).json(response(201, "Comment created successfully", comment));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while creating comment"));
        }
    },
    getComments: async (req, res) => {
        try {
            const { post_id, limit, page } = req.query;
            const limitNum = limit ? Number(limit) : 10;
            const pageNum = page ? Number(page) : 1;
            const offset = (pageNum - 1) * limitNum;
            
            const whereClause = {};
            if (post_id) whereClause.post_id = post_id;

            const { rows, count } = await Comment.findAndCountAll({
                where: whereClause,
                include: [
                    { model: User, attributes: ['id', 'username', 'avatar'] }
                ],
                order: [['createdAt', 'ASC']],
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

            return res.status(200).json(response(200, "Comments retrieved successfully", formatPagination));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while retrieving comments"));
        }
    },
    deleteComment: async (req, res) => {
        try {
            const { id } = req.params;
            const comment = await Comment.findByPk(id);

            if (!comment) {
                return res.status(404).json(response(404, "Error", "Comment not found"));
            }

            if (comment.user_id !== req.user.id) {
                return res.status(403).json(response(403, "Error", "forbidden"));
            }

            await Comment.destroy({ where: { id } });

            return res.status(200).json(response(200, "Comment deleted successfully", null));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while deleting comment"));
        }
    }
};
