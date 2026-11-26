const express = require('express');
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const port = 3001;
const methodOverride = require("method-override");
const db = require("./models");
const cors = require("cors");
const compression = require('compression');
app.use(cors());
app.use(compression());

const authRoutes = require("./routes/auth.routes");
const publicRoutes = require("./routes/public.routes");
const medicalCheckupRoutes = require("./routes/medical_checkup.route");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const likeRoutes = require("./routes/like.routes");
const userRoutes = require("./routes/user.routes");
const chatMessageRoutes = require("./routes/chatMessage.routes");
const exerciseRecommendationRoutes = require("./routes/exerciseRecommendation.routes");
const communityMembersRoutes = require("./routes/communityMembers.routes");
const communityRoutes = require("./routes/community.routes");
const workoutRoutes = require("./routes/workout.routes");
const reportRoutes = require("./routes/report.routes");
const articleRoutes = require("./routes/article.routes");
const challengeRoutes = require("./routes/challenge.routes");
const chatSocket = require("./sockets/chat.socket");
const {checkToken} = require("./middleware/auth");

// mengecek apakah koneksi database berhasil
db.sequelize.authenticate()
.then(async () => {
    console.log("Database connected");
    try {
        await db.sequelize.query(`ALTER TABLE "Posts" ADD COLUMN IF NOT EXISTS "status" VARCHAR(255) DEFAULT 'pending';`);
        console.log("Post status column verified/added");
    } catch(e) {
        console.log("Post status migration error:", e.message);
    }
    try {
        await db.sequelize.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "status" VARCHAR(255) DEFAULT 'active';`);
        console.log("User status column verified/added");
    } catch(e) {
        console.log("User status migration error:", e.message);
    }
    try {
        await Promise.all([
            db.Workout_Log?.sync(),
            db.Post_Report?.sync(),
            db.Article?.sync(),
            db.Challenge?.sync(),
            db.Challenge_Participant?.sync(),
        ]);
        console.log("Extended feature tables verified/synced");
    } catch (e) {
        console.log("Extended tables sync error:", e.message);
    }
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
app.use('/public', publicRoutes);
app.use('/posts', checkToken, postRoutes);
app.use('/comments', checkToken, commentRoutes);
app.use('/likes', checkToken, likeRoutes);
app.use('/users', checkToken, userRoutes);
app.use('/chat-messages', checkToken, chatMessageRoutes);
app.use('/exercise-recommendations', checkToken, exerciseRecommendationRoutes);
app.use('/community-members', checkToken, communityMembersRoutes);
app.use('/communities', checkToken, communityRoutes);
app.use('/medical-checkup', checkToken, medicalCheckupRoutes);
app.use('/workouts', checkToken, workoutRoutes);
app.use('/reports', checkToken, reportRoutes);
app.use('/articles', checkToken, articleRoutes);
app.use('/challenges', checkToken, challengeRoutes);

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