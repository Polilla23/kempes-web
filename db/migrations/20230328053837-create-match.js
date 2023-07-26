'use strict';

const { MATCH_TABLE, MatchSchema } = require('./../models/match.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(MATCH_TABLE, MatchSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(MATCH_TABLE);
  }
};
