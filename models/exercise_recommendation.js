'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class exercise_recommendation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  exercise_recommendation.init({
    bmi_category: DataTypes.INTEGER,
    recommendation: DataTypes.TEXT,
    duration: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'exercise_recommendation',
  });
  return exercise_recommendation;
};