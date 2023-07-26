'use strict';

const { TRANSFER_TABLE } = require('./../models/transfer.model');
const { PERIOD_TABLE } = require('./../models/period.model');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.changeColumn(TRANSFER_TABLE, 'periodId', {
      field: 'period_id',
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: PERIOD_TABLE,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.changeColumn(TRANSFER_TABLE, 'periodId', {
      field: 'period_id',
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'periods',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
};
