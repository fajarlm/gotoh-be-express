'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
// Memaksa Vercel NFT (Node File Trace) untuk menyertakan driver pg ke dalam bundle Serverless
require('pg');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

/*
// ============================================================================
// KODE SEBELUMNYA (Membaca file model secara dinamis menggunakan readdirSync):
// ============================================================================
// Fungsi asli: Membaca seluruh file .js di folder 'models' ini secara otomatis
// agar tidak perlu menulis require satu per satu.
//
// Alasan diubah: Pada environment serverless seperti Vercel, readdirSync dinamis 
// menyebabkan bundler Vercel (Node File Trace) tidak dapat melacak dependencies,
// sehingga file model tidak ikut dibungkus ke dalam deployment (terjadi Error 500).
//
// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       file.indexOf('.test.js') === -1
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });
// ============================================================================
*/

// Kode Baru: Memuat model secara eksplisit/statis agar Vercel dapat melacak dan
// membungkus model ke dalam deployment secara aman saat proses build.
const models = [
  require('./chat_message'),
  require('./comment'),
  require('./community'),
  require('./community_members'),
  require('./exercise_recommendation'),
  require('./like'),
  require('./medical_checkup'),
  require('./post'),
  require('./user'),
];

models.forEach(modelFactory => {
  const model = modelFactory(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
