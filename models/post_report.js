'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post_Report extends Model {
    static associate(models) {
      Post_Report.belongsTo(models.Post, { foreignKey: 'post_id' });
      Post_Report.belongsTo(models.User, { foreignKey: 'reporter_id', as: 'Reporter' });
    }
  }
  Post_Report.init({
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false, // spam, misinformation, harassment, other
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending', // pending, reviewed, dismissed
    },
  }, {
    sequelize,
    modelName: 'Post_Report',
  });
  return Post_Report;
};
