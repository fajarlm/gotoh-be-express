const { Like, Post } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
    toggleLike: async (req, res) => {
        try {
            const { post_id } = req.body;
            
            if (!post_id) {
                return res.status(400).json(response(400, "Error", "post_id is required"));
            }

            const post = await Post.findByPk(post_id);
            if (!post) {
                return res.status(404).json(response(404, "Error", "Post not found"));
            }

            const existingLike = await Like.findOne({
                where: { user_id: req.user.id, post_id: post_id }
            });

            if (existingLike) {
                await existingLike.destroy();
                return res.status(200).json(response(200, "Post unliked", null));
            } else {
                const like = await Like.create({ user_id: req.user.id, post_id: post_id });
                return res.status(201).json(response(201, "Post liked", like));
            }
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while toggling like"));
        }
    },
    getLikes: async (req, res) => {
        try {
            const { post_id } = req.query;
            
            const whereClause = {};
            if (post_id) whereClause.post_id = post_id;

            const { count, rows } = await Like.findAndCountAll({
                where: whereClause
            });

            return res.status(200).json(response(200, "Likes retrieved successfully", { total: count, data: rows }));
        } catch (error) {
            return res.status(500).json(response(500, "Error", "An error occurred while retrieving likes"));
        }
    }
};
