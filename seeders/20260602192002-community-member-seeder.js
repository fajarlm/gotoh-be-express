'use strict';
const { User,Community } = require('../models');
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await User.findAll({ raw: true });
    const communities = await Community.findAll({ raw: true });
    const userId1 = users.find(u => u.username === 'fajar')?.id || 1;
    const userId2 = users.find(u => u.username === 'rizky')?.id || 2;
    const community1 = communities.find(c => c.name === 'Fitness Bogor')?.id || 1;
    const community2 = communities.find(c => c.name === 'Healthy Lifestyle')?.id || 2;
    await queryInterface.bulkInsert('Community_Members', [
      {
        user_id: userId1,
        community_id: community1,
        joined_at: new Date(),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: userId2,
        community_id: community1,
        joined_at: new Date(),
        role: 'member',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: userId2,
        community_id: community2,
        joined_at: new Date(),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Community_Members', null, {});
  }
};