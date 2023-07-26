'use strict';

const { PLAYER_TABLE, PlayerSchema } = require('./../models/player.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(PLAYER_TABLE, PlayerSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(PLAYER_TABLE);
  }
};
