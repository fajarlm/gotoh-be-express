'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Workout_Log extends Model {
    static associate(models) {
      Workout_Log.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Workout_Log.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'cardio', // cardio, strength, flexibility, walking
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    completed_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Workout_Log',
  });
  return Workout_Log;
};
