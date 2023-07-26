'use strict';

const { EVENT_TABLE, EventSchema } = require('./../models/event.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(EVENT_TABLE, EventSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(EVENT_TABLE);
  }
};
