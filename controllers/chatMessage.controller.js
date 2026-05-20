const Validator = require("fastest-validator");
const v = new Validator();
const { Chat_Message, } = require("../models")
const { response } = require("../helpers/response.formatter");
const passwordHash = require('password-hash')
const { auth_secret } = require('../config/base.config')
const jwt = require('jsonwebtoken')
const { Op } = require("sequelize");

module.exports = {
    chatMessageController: async (io) => {
        io.on('connection', (socket) => {

            console.log(socket.id);

            // join group
            socket.on('join_group', async (data) => {

                socket.join(
                    `group-${data.groupId}`
                );

            });

            // kirim chat
            socket.on(
                'send_message',
                async (data) => {

                    // simpan DB
                    const message =
                        await ChatMessage.create({

                            groupId: data.groupId,
                            userId: data.userId,
                            message: data.message

                        });

                    // realtime
                    io.to(
                        `group-${data.groupId}`
                    ).emit(
                        'receive_message',
                        message
                    );

                }
            );

        });
    }
}