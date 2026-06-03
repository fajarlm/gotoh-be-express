
const { Chat_Message, User } = require("../models");

module.exports=(io)=>{

    let users=[];

    io.on("connection",(socket)=>{

        console.log(
            "connect:",
            socket.id
        );

        socket.on(
            "join_room",
            (data)=>{

                socket.join(
                    `group-${data.groupId}`
                );

                users = users.filter(u => u.socketId !== socket.id);

                users.push({
                    socketId:socket.id,
                    username:data.username,
                    groupId:data.groupId
                });

                io.to(
                    `group-${data.groupId}`
                ).emit(
                    "online_users",
                    users.filter(
                        user=>
                        user.groupId===data.groupId
                    )
                );

            }
        );

        socket.on(
            "send_message",
            async(data)=>{
                try {
                    const savedMessage = await Chat_Message.create({
                        user_id: data.userId,
                        community_id: data.groupId,
                        message: data.message
                    });

                    // Ambil pesan dengan menyertakan detail user agar format sama dengan response API
                    const messageWithUser = await Chat_Message.findOne({
                        where: { id: savedMessage.id },
                        include: [
                            { model: User, attributes: ['id', 'username', 'avatar'] }
                        ]
                    });

                    io.to(
                        `group-${data.groupId}`
                    ).emit(
                        "receive_message",
                        messageWithUser
                    );
                } catch (error) {
                    console.error("Error saving/sending message in socket:", error.message);
                }
            }
        );

        socket.on(
            "disconnect",
            ()=>{

                const user=
                users.find(
                    user=>
                    user.socketId===socket.id
                );

                if(user){

                    users=
                    users.filter(
                        u=>
                        u.socketId!==socket.id
                    );

                    io.to(
                        `group-${user.groupId}`
                    ).emit(
                        "online_users",
                        users.filter(
                            u=>
                            u.groupId===user.groupId
                        )
                    );

                }

            }
        );

    });

}