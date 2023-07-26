'use strict';

const { PERIOD_TABLE, PeriodSchema } = require('./../models/period.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(PERIOD_TABLE, PeriodSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(PERIOD_TABLE);
  }
};
