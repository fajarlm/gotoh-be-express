const express = require('express');
const app = express();

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");

const port = 3000;

const methodOverride = require("method-override");

const db = require("./models");

const authRoutes = require("./routes/auth.routes");
const chatSocket = require("./sockets/chat.socket");


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

// membuat instance socket server
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// menjalankan semua event socket
chatSocket(io);

// menjalankan server express + socket
server.listen(port, () => {

    console.log(`Server running at port ${port}`);

});


// export agar bisa dipakai file lain
module.exports = {
    io,
    server
};