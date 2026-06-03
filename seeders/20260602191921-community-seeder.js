'use strict';
const { User } = require('../models');
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await User.findAll({ raw: true });
    const userId1 = users.find(u => u.username === 'fajar')?.id || 1;
    const userId2 = users.find(u => u.username === 'rizky')?.id || 2;

    await queryInterface.bulkInsert('Communities', [
      {
        name: 'Fitness Bogor',
        description: 'Komunitas olahraga Bogor',
        cover_image: 'fitness.jpg',
        created_by: userId1,
        location: 'Bogor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Healthy Lifestyle',
        description: 'Komunitas hidup sehat',
        cover_image: 'healthy.jpg',
        created_by: userId2,
        location: 'Jakarta',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Communities', null, {});
  }
};