# GOTOH Backend API

Backend API untuk aplikasi GOTOH (Go Health) berbasis Node.js, Express, dan Sequelize ORM dengan dukungan PostgreSQL (Supabase) dan Real-time Chat menggunakan Socket.io.

## 🚀 Fitur Utama

- **Authentication**: Registrasi, login, dan autentikasi berbasis JWT Token.
- **User Management**: Manajemen profil pengguna, status akun, dan target kesehatan.
- **Community**: Pembuatan komunitas (publik/privat), bergabung dengan komunitas, dan manajemen anggota.
- **Post & Feed**: Publikasi postingan berupa teks dan gambar, status postingan (pending, approved, rejected).
- **Interactive Features**: Like postingan dan komentar postingan.
- **Real-time Chatting**: Pesan instan dalam komunitas menggunakan Socket.io.
- **Health & Fitness Tools**:
  - Rekomendasi olahraga berdasarkan kategori BMI.
  - Pencatatan pemeriksaan kesehatan mandiri (Tekanan Darah, Detak Jantung, Gula Darah, Kolesterol, Berat & Tinggi Badan).

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database ORM**: Sequelize ORM
- **Database Engine**: PostgreSQL (Supabase) / MySQL
- **Real-time Communication**: Socket.io
- **Validation**: Fastest Validator
- **File Upload**: Multer

---

## 📂 Struktur Folder

```text
be-express/
├── config/             # Konfigurasi database Sequelize
├── controllers/        # Logika utama API Endpoint
├── helpers/            # Fungsi bantuan (Format respon, dll)
├── middleware/         # Middleware Express (Autentikasi JWT, Upload File)
├── migrations/         # Berkas migrasi database Sequelize
├── models/             # Definisi model Sequelize (User, Post, Comment, dll)
├── routes/             # Definisi routing API Express
├── seeders/            # Data awal (seeding) database
├── sockets/            # Konfigurasi event handler Socket.io
├── uploads/            # Direktori penyimpanan media (gambar/avatar)
├── app.js              # Entrypoint utama server Express
└── supabase_schema.sql # Skema SQL PostgreSQL untuk Supabase
```

---

## ⚙️ Cara Instalasi & Menjalankan Project

### 1. Klon Repositori dan Instal Dependensi

```bash
npm install
```

### 2. Konfigurasi Environment Variables

Salin berkas `.env.example` menjadi `.env` lalu sesuaikan konfigurasinya:

```env
PORT=3001
DB_USERNAME=username
DB_PASSWORD=password
DB_NAME=database_name
DB_HOST=127.0.0.1
DB_DIALECT=postgres # postgres atau mysql
JWT_SECRET=rahasia_super_secure
```

### 3. Jalankan Migrasi Database

```bash
npx sequelize-db:migrate
```

### 4. Jalankan Server Development

```bash
npm run dev
```

Server akan berjalan secara default di [http://localhost:3001](http://localhost:3001).

---

## 🔗 Endpoint API

Berikut adalah beberapa routing utama yang tersedia:

| Method | Endpoint | Deskripsi | Autentikasi |
|--------|----------|-----------|-------------|
| **POST** | `/register` | Registrasi user baru | Tidak |
| **POST** | `/login` | Login user & mendapatkan JWT Token | Tidak |
| **GET** | `/posts` | Mengambil daftar postingan feed | Ya |
| **POST** | `/posts` | Membuat postingan baru (mendukung gambar) | Ya |
| **GET** | `/comments` | Mengambil komentar dari postingan | Ya |
| **POST** | `/comments` | Membuat komentar baru pada postingan | Ya |
| **GET** | `/communities` | Mengambil daftar komunitas | Ya |
| **POST** | `/communities` | Membuat komunitas baru | Ya |
| **GET** | `/chat-messages` | Mengambil riwayat chat komunitas | Ya |
| **GET** | `/medical-checkup` | Mengambil data rekam medis user | Ya |
| **POST** | `/medical-checkup` | Menyimpan data rekam medis baru | Ya |
| **GET** | `/exercise-recommendations` | Mendapatkan rekomendasi olahraga | Ya |
