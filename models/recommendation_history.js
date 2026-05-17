'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recommendation_History extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Recommendation_History.belongsTo(models.User,
        { foreignKey: 'user_id' }
      );
    }
  }
  Recommendation_History.init({
    user_id: DataTypes.INTEGER,
    bmi: DataTypes.INTEGER,
    recommendation: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Recommendation_History',
  });
  return Recommendation_History;
};