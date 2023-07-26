'use strict';

const { EVENT_TYPE_TABLE, EventTypeSchema } = require('./../models/event-type.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(EVENT_TYPE_TABLE, EventTypeSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(EVENT_TYPE_TABLE);
  }
};
