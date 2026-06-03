'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        username: 'fajar',
        email: 'fajar@example.com',
        password: '$2b$10$hashedpassword',
        health_target: 'membangun_otot',
        avatar: 'fajar.jpg',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'rizky',
        email: 'rizky@example.com',
        password: '$2b$10$hashedpassword',
        health_target: 'gaya_hidup_sehat',
        avatar: 'rizky.jpg',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: '$2b$10$hashedpassword',
        health_target: 'menurunkan_berat_badan',
        avatar: 'admin.jpg',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};