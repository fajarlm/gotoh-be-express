'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Challenge extends Model {
    static associate(models) {
      Challenge.belongsTo(models.Community, { foreignKey: 'community_id' });
      Challenge.belongsTo(models.User, { foreignKey: 'creator_id', as: 'Creator' });
      Challenge.hasMany(models.Challenge_Participant, { foreignKey: 'challenge_id' });
    }
  }
  Challenge.init({
    community_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    target_days: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'hari',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Challenge',
  });
  return Challenge;
};
