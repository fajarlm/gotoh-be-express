'use strict';
const { User } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get user IDs
    const users = await User.findAll({ raw: true });
    const userId1 = users.find(u => u.username === 'fajar')?.id || 1;
    const userId2 = users.find(u => u.username === 'rizky')?.id || 2;

    await queryInterface.bulkInsert('Posts', [
      {
        user_id: userId1,
        type: 'public',
        content: 'Hari ini lari 5 KM 🔥',
        image: 'running.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: userId2,
        type: 'public',
        content: 'Menu diet hari ini 🥗',
        image: 'diet.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Posts', null, {});
  }
};