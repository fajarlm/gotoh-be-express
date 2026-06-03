const { Chat_Message, User } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {
    getMessages: async (req, res) => {
        try {
            const { community_id } = req.params;
            const messages = await Chat_Message.findAll({
                where: {
                    community_id: community_id
                },
                include: [
                    { model: User, attributes: ['id', 'username', 'avatar'] }
                ],
                order: [['createdAt', 'ASC']]
            });

            return res.status(200).json(response(200, "Messages retrieved successfully", messages));
        } catch (error) {
            return res.status(500).json(response(500, "Error", error.message));
        }
    },
    createMessage: async (req, res) => {
        try {
            const { message } = req.body;
            const { community_id } = req.params;
            const image_message = req.file ? req.file.filename : null;

            const newMessage = await Chat_Message.create({
                user_id: req.user.id,
                community_id: community_id,
                message: message,
                image_message: image_message
            });

            return res.status(201).json(response(201, "Message sent successfully", newMessage));
        } catch (error) {
            return res.status(500).json(response(500, "Error", error.message));
        }
    }
}