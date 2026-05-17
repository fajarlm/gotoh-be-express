const express = require('express');
const app = express();

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");

const port = 3000;

const methodOverride = require("method-override");

const db = require("./models");

const authRoutes = require("./routes/auth.routes");


// ================= DATABASE =================

// mengecek apakah koneksi database berhasil
db.sequelize.authenticate()
.then(() => {
    console.log("Database connected");
})
.catch((err) => {
    console.log(err);
});


// ================= MIDDLEWARE =================

// agar Express bisa membaca body request JSON
// contoh:
// {
//   "name":"Fajar"
// }
app.use(express.json());


// methodOverride dipakai agar form HTML
// bisa menggunakan PUT / DELETE
// contoh:
// POST /users?_method=DELETE
app.use(methodOverride("_method"));


// agar folder uploads dapat diakses dari browser
// contoh:
// localhost:3000/uploads/foto.jpg
app.use('/uploads', express.static('uploads'));


// mendaftarkan routing
app.use('/', authRoutes);


// membuat instance socket server
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});


// ketika user connect ke socket
io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    // contoh event menerima pesan
    socket.on("sendMessage", (data) => {

        console.log(data);

        // kirim ke semua user
        io.emit("newMessage", data);

    });


    // ketika user disconnect
    socket.on("disconnect", () => {

        console.log("User disconnected");

    });

});


// menjalankan server express + socket
server.listen(port, () => {

    console.log(`Server running at port ${port}`);

});


// export agar bisa dipakai file lain
module.exports = {
    io,
    server
};