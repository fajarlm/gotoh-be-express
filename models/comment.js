'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    // Helper method for defining associations.
    static associate(models) {
      // define association here
      Comment.belongsTo(models.User,
        { foreignKey: 'user_id' }
      );
      Comment.belongsTo(models.Post,
        { foreignKey: 'post_id' }
       );
    }
  }
  Comment.init({
    user_id: DataTypes.INTEGER,
    post_id: DataTypes.INTEGER,
    content: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};