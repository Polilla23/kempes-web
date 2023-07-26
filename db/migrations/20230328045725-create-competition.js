'use strict';

const { COMPETITION_TABLE, CompetitionSchema} = require('./../models/competition.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(COMPETITION_TABLE, CompetitionSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(COMPETITION_TABLE);
  }
};
