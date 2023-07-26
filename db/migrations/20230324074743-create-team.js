'use strict';

const { TeamSchema, TEAM_TABLE } = require('./../models/team.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(TEAM_TABLE, TeamSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(TEAM_TABLE);
  }
};
