'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    // Helper method for defining associations.
    static associate(models) {
      // define association here
      Post.belongsTo(models.User,
        { foreignKey: 'user_id' }
      );
      Post.hasMany(models.Comment, { foreignKey: 'post_id' });
      Post.hasMany(models.Like, { foreignKey: 'post_id' });
    }
  }
  Post.init({
    user_id: DataTypes.INTEGER,
    type: DataTypes.ENUM('public', 'private'),
    content: DataTypes.STRING,
    image: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending' // 'pending', 'approved', 'rejected'
    }
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};