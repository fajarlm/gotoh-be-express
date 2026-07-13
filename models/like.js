'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    // Helper method for defining associations.
    static associate(models) {
      // define association here
      Like.belongsTo(models.User,
        { foreignKey: 'user_id' }
      );
      Like.belongsTo(models.Post,
        { foreignKey: 'post_id' }
      );
    }
  }
  Like.init({
    user_id: DataTypes.INTEGER,
    post_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Like',
  });
  return Like;
};