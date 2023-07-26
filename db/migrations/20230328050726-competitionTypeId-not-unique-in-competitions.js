'use strict';

const { COMPETITION_TABLE } = require('./../models/competition.model');
const { COMPETITION_TYPE_TABLE } = require('./../models/competition-type.model');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.changeColumn(COMPETITION_TABLE, 'competitionTypeId', {
      field: 'competition_type_id',
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: COMPETITION_TYPE_TABLE,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.changeColumn(BALANCE_TABLE, 'competitionTypeId', {
      field: 'competition_type_id',
      allowNull: false,
      unique: true,
      type: DataTypes.INTEGER,
      references: {
        model: COMPETITION_TYPE_TABLE,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
};
