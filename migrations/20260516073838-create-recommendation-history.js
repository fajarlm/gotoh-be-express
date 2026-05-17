'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Recommendation_Histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      bmi: {
        type: Sequelize.INTEGER
      },
      recommendation: {
        type: Sequelize.TEXT
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
    queryInterface.addConstraint('Recommendation_Histories', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_recommendation_histories_user_id',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Recommendation_Histories');
  }
};