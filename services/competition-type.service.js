const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class CompetitionTypeService {
  constructor() {}

  async create(data) {
    const competitionType = await models.CompetitionType.create(data);
    return competitionType;
  }

  async find() {
    const competitionTypes = await models.CompetitionType.findAll();
    return competitionTypes;
  }

  async findOne(id) {
    const competitionType = await models.CompetitionType.findByPk(id);
    if (!competitionType) {
      throw boom.notFound(`No se encontro el tipo de competencia con id ${id}`);
    }
    return competitionType;
  }

  async update(id, changes) {
    const competitionType = await models.CompetitionType.findByPk(id);
    if (!competitionType) {
      throw boom.notFound(`No se encontro el tipo de competencia con id ${id}`);
    }
    const updatedCompetitionType = await competitionType.update(changes);
    return updatedCompetitionType;
  }

  async delete(id) {
    const competitionType = await models.CompetitionType.findByPk(id);
    if (!competitionType) {
      throw boom.notFound(`No se encontro el tipo de competencia con id ${id}`);
    }
    await competitionType.destroy();
    return { message: `Tipo de competencia con id ${id} eliminado`};
  }
}

module.exports = CompetitionTypeService;
