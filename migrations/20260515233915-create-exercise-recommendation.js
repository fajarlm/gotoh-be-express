'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exercise_recommendations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bmi_category: {
        type: Sequelize.STRING
      },
      recommendation: {
        type: Sequelize.TEXT
      },
      duration: {
        type: Sequelize.INTEGER
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
    
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('exercise_recommendations');
  }
};