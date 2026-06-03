'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Community_Members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      community_id: {
        type: Sequelize.INTEGER
      },
      joined_at: {
        type: Sequelize.DATE
      },
      role :{
        type: Sequelize.ENUM('admin', 'member'),
        defaultValue: 'member'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    queryInterface.addConstraint('Community_Members', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_community_members_user_id',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    queryInterface.addConstraint('Community_Members', {
      fields: ['community_id'],
      type: 'foreign key',
      name: 'fk_community_members_community_id',
      references: {
        table: 'Communities',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }); 
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Community_Members');
  }
};