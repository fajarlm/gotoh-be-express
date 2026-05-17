'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat_Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chat_Message.belongsTo(models.User,
        { foreignKey: 'user_id' }
      );
      Chat_Message.belongsTo(models.Group_Chat,
        { foreignKey: 'group_chat_id' }
      );
    }
  }
  Chat_Message.init({
    user_id: DataTypes.INTEGER,
    group_chat_id: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    image_message: DataTypes.STRING,
    is_read: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false }
  }, {
    sequelize,
    modelName: 'Chat_Message',
  });
  return Chat_Message;
};