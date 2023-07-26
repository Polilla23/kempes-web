'use strict';

const { TRANSFER_TABLE, TransferSchema } = require('./../models/transfer.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(TRANSFER_TABLE, TransferSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(TRANSFER_TABLE);
  }
};
