'use strict';

const { SEASON_TABLE, SeasonSchema } = require('./../models/season.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(SEASON_TABLE, SeasonSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(SEASON_TABLE);
  }
};
