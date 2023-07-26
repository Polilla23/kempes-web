'use strict';

const { COMPETITION_TYPE_TABLE, CompetitionTypeSchema } = require('./../models/competition-type.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(COMPETITION_TYPE_TABLE, CompetitionTypeSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(COMPETITION_TYPE_TABLE);
  }
};
