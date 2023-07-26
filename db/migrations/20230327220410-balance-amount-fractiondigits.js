'use strict';

const { BALANCE_TABLE } = require('./../models/balance.model');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.changeColumn(BALANCE_TABLE, 'amount', {
      allowNull: false,
      type: DataTypes.INTEGER,
      get() {
        const value = this.getDataValue('amount');
        if (value != null) {
          return value.toLocaleString(undefined, { maximumFractionDigits: 0})
        }
        return null
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.changeColumn(BALANCE_TABLE, 'amount', {
      allowNull: false,
      type: DataTypes.INTEGER,
    });
  }
};
