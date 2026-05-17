'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group_Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Group_Chat.belongsTo(models.User,
        { foreignKey: 'user_id' }
      );
      Group_Chat.belongsTo(models.Community,
        { foreignKey: 'community_id' }
       );
    }
  }
  Group_Chat.init({
    user_id: DataTypes.INTEGER,
    community_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Group_Chat',
  });
  return Group_Chat;
};