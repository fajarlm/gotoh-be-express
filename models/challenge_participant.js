'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Challenge_Participant extends Model {
    static associate(models) {
      Challenge_Participant.belongsTo(models.Challenge, { foreignKey: 'challenge_id' });
      Challenge_Participant.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Challenge_Participant.init({
    challenge_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_checkin_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Challenge_Participant',
  });
  return Challenge_Participant;
};
