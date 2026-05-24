'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Community extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Community.belongsTo(models.User,
        { foreignKey: 'created_by' }
      );
      Community.hasMany(models.Post,
        { foreignKey: 'community_id' }
      );
      Community.belongsToMany(models.User,
         { through: models.Community_Members, foreignKey: 'community_id' }
      );
       Community.hasMany(models.Group_Chat,
        { foreignKey: 'community_id' }
       );
       Community.hasMany(models.Like,
        { foreignKey: 'community_id' }
       );
       Community.hasMany(models.Recommendation_History,
        { foreignKey: 'community_id' }
       );
    }
  }
  Community.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    category: DataTypes.STRING,
    type: DataTypes.ENUM('public', 'private'),
    cover_image: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    location: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Community',
  });
  return Community;
};