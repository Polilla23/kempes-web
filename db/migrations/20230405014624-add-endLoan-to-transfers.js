'use strict';

const { TRANSFER_TABLE } = require('./../models/transfer.model');
const { SEASON_TABLE } = require('./../models/season.model');
const { PERIOD_TABLE } = require('./../models/period.model');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn(TRANSFER_TABLE, 'endLoanSeasonId', {
      field: 'end_loan_season_id',
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: null,
      references: {
        model: SEASON_TABLE,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn(TRANSFER_TABLE, 'endLoanPeriodId', {
      field: 'end_loan_period_id',
      allowNull: true,
      type: DataTypes.INTEGER,
      defaultValue: null,
      references: {
        model: PERIOD_TABLE,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      });
    },

    down: async (queryInterface) => {
      await queryInterface.removeColumn(TRANSFER_TABLE, 'endLoanSeasonId');
      await queryInterface.removeColumn(TRANSFER_TABLE, 'endLoanPeriodId');
    }
  };
