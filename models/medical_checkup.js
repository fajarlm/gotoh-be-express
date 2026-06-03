'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class medical_checkup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      medical_checkup.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  medical_checkup.init({
    user_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    blood_pressure: DataTypes.STRING,
    heart_rate: DataTypes.INTEGER,
    blood_sugar: DataTypes.FLOAT,
    cholesterol: DataTypes.FLOAT,
    weight: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'medical_checkup',
  });
  return medical_checkup;
};