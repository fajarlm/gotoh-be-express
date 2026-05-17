'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Community_Members extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Community_Members.belongsTo(models.User,
        { foreignKey: 'user_id' }
      );
      Community_Members.belongsTo(models.Community,
        { foreignKey: 'community_id' }
       );
    }
  }
  Community_Members.init({
    user_id: DataTypes.INTEGER,
    community_id: DataTypes.INTEGER,
    joined_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Community_Members',
  });
  return Community_Members;
};