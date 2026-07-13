'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class exercise_recommendation extends Model {
    // Helper method for defining associations.
    static associate(models) {
      // define association here
      
    }
  }
  exercise_recommendation.init({
    bmi_category: DataTypes.STRING,
    recommendation: DataTypes.TEXT,
    duration: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'exercise_recommendation',
  });
  return exercise_recommendation;
};