'use strict';

const { BALANCE_TABLE, BalanceSchema } = require('./../models/balance.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(BALANCE_TABLE, BalanceSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(BALANCE_TABLE);
  }
};
