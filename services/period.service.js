const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class PeriodService {
  constructor() {}

  async create(data) {
    const period = await models.Period.create(data);
    return period;
  }

  async find() {
    const periods = await models.Period.findAll();
    return periods;
  }

  async findOne(id) {
    const period = await models.Period.findByPk(id);
    if (!period) {
      throw boom.notFound(`No se encontro el periodo con id ${id}`);
    }
    return period;
  }

  async update(id, changes) {
    const period = await models.Period.findByPk(id);
    if (!period) {
      throw boom.notFound(`No se encontro el periodo con id ${id}`);
    }
    const updatedPeriod = await period.update(changes);
    return updatedPeriod;
  }

  async delete(id) {
    const period = await models.Period.findByPk(id);
    if (!period) {
      throw boom.notFound(`No se encontro el periodo con id ${id}`);
    }
    await period.destroy();
    return { message: `Periodo con id ${id} eliminado`};
  }
}

module.exports = PeriodService;
