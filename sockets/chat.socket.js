const ChatMessage = require('../models/chat_message');

module.exports=(io)=>{

io.on('connection',(socket)=>{

    console.log(socket.id);

    // join group
    socket.on('join_group',async(data)=>{

        socket.join(
            `group-${data.groupId}`
        );

    });

    // kirim chat
    socket.on(
        'send_message',
        async(data)=>{

            // simpan DB
            const message=
            await ChatMessage.create({

                groupId:data.groupId,
                userId:data.userId,
                message:data.message

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

};