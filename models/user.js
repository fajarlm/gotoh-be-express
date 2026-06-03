'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Post, 
        { foreignKey: 'user_id' }
      );
      User.belongsToMany(models.Community,
         { through: models.Community_Members, foreignKey: 'user_id' }
      );
      User.hasMany(models.Comment, { foreignKey: 'user_id' });
      User.hasMany(models.Like, { foreignKey: 'user_id' });
      User.hasMany(models.Chat_Message, { foreignKey: 'user_id' });
      User.hasMany(models.medical_checkup, { foreignKey: 'user_id' });

    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    health_target: DataTypes.ENUM('menurunkan_berat_badan', 'gaya_hidup_sehat', 'membangun_otot'),
    avatar: DataTypes.STRING,
    role: DataTypes.ENUM('user', 'admin'),
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};