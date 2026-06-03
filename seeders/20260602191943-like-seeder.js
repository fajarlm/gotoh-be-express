'use strict';
const { User } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await User.findAll({ raw: true });
    const userId1 = users.find(u => u.username === 'fajar')?.id || 1;
    const userId2 = users.find(u => u.username === 'rizky')?.id || 2;
    await queryInterface.bulkInsert('Likes', [
      {
        user_id: userId2,
        post_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: userId1,
        post_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Likes', null, {});
  }
};