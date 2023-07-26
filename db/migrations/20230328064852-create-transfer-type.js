'use strict';

const { TRANSFER_TYPE_TABLE, TransferTypeSchema } = require('./../models/transfer-type.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(TRANSFER_TYPE_TABLE, TransferTypeSchema);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(TRANSFER_TYPE_TABLE);
  }
};
