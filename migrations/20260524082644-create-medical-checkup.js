'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('medical_checkups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      blood_pressure: {
        type: Sequelize.STRING
      },
      heart_rate: {
        type: Sequelize.INTEGER
      },
      blood_sugar: {
        type: Sequelize.FLOAT
      },
      cholesterol: {
        type: Sequelize.FLOAT
      },
      weight: {
        type: Sequelize.FLOAT
      },
      height: {
        type: Sequelize.FLOAT
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
      queryInterface.addConstraint('medical_checkups', {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'fk_medical_checkups_user_id',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE' 
    });
    
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('medical_checkups');
  }
};