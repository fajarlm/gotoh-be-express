'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
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
      type: {
        type: Sequelize.ENUM('community', 'personal')
      },
      content: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
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
    queryInterface.addConstraint('Posts', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_posts_user_id',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    queryInterface.addConstraint('Posts', {
      fields: ['community_id'],
      type: 'foreign key',
      name: 'fk_posts_community_id',
      references: {
        table: 'Communities',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }); 
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts');
  }
};