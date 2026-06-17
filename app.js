const express = require('express');
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const port = 3001;
const methodOverride = require("method-override");
const db = require("./models");
cors = require("cors");
const compression = require('compression');
app.use(cors());
app.use(compression());

const authRoutes = require("./routes/auth.routes");
const medicalCheckupRoutes = require("./routes/medical_checkup.route");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const likeRoutes = require("./routes/like.routes");
const userRoutes = require("./routes/user.routes");
const chatMessageRoutes = require("./routes/chatMessage.routes");
const exerciseRecommendationRoutes = require("./routes/exerciseRecommendation.routes");
const communityMembersRoutes = require("./routes/communityMembers.routes");
const communityRoutes = require("./routes/community.routes");
const chatSocket = require("./sockets/chat.socket");
const {checkToken} = require("./middleware/auth");

// mengecek apakah koneksi database berhasil
db.sequelize.authenticate()
.then(() => {
    console.log("Database connected");
})
.catch((err) => {
    console.log(err);
});

// agar Express bisa membaca body request JSON
app.use(express.json());

// methodOverride dipakai agar form HTML
app.use(methodOverride("_method"));

// agar folder uploads dapat diakses dari browser
app.use('/uploads', express.static('uploads'));

app.use('/', authRoutes);
app.use('/posts', checkToken, postRoutes);
app.use('/comments', checkToken, commentRoutes);
app.use('/likes', checkToken, likeRoutes);
app.use('/users', checkToken, userRoutes);
app.use('/chat-messages', checkToken, chatMessageRoutes);
app.use('/exercise-recommendations', checkToken, exerciseRecommendationRoutes);
app.use('/community-members', checkToken, communityMembersRoutes);
app.use('/communities', checkToken, communityRoutes);
app.use('/medical-checkup', checkToken, medicalCheckupRoutes);

// membuat instance socket server
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// menjalankan semua event socket
chatSocket(io);

// menjalankan server express + socket jika tidak di Vercel
if (!process.env.VERCEL) {
    server.listen(port, () => {
        console.log(`Server running at port ${port}`);
    });
}

// export app agar Vercel Node handler bisa membaca routing Express
module.exports = app;

/* 
// Code sebelumnya (sebelum deploy ke Vercel):
server.listen(port, () => {
    console.log(`Server running at port ${port}`);
});

module.exports = {
    io,
    server
};
*/