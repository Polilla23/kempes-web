'use strict';

const { COMPETITION_TEAM_TABLE, CompetitionTeamSchema} = require('./../models/competition-team.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(COMPETITION_TEAM_TABLE, CompetitionTeamSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(COMPETITION_TEAM_TABLE);
  }
};
