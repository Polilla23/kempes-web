const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class TransferTypeService {
  constructor() {}

  async create(data) {
    const transferType = await models.TransferType.create(data);
    return transferType;
  }

  async find() {
    const transferTypes = await models.TransferType.findAll();
    return transferTypes;
  }

  async findOne(id) {
    const transferType = await models.TransferType.findByPk(id);
    if (!transferType) {
      throw boom.notFound(`No se encontro el tipo de transferencia con id ${id}`);
    }
    return transferType;
  }

  async update(id, changes) {
    const transferType = await models.TransferType.findByPk(id);
    if (!transferType) {
      throw boom.notFound(`No se encontro el tipo de transferencia con id ${id}`);
    }
    const updatedTransferType = await transferType.update(changes);
    return updatedTransferType;
  }

  async delete(id) {
    const transferType = await models.TransferType.findByPk(id);
    if (!transferType) {
      throw boom.notFound(`No se encontro el tipo de transferencia con id ${id}`);
    }
    await transferType.destroy();
    return { message: `Tipo de transferencia con id ${id} eliminado`};
  }
}

module.exports = TransferTypeService;
