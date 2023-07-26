const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class SeasonService {
  constructor() {}

  async create(data) {
    const season = await models.Season.create(data);
    return season;
  }

  async find() {
    const seasons = await models.Season.findAll({
      include: ['period']
    });
    return seasons;
  }

  async findActive() {
    const season = await models.Season.findAll({ where: { isActive: true } });
    if (!season) {
      throw boom.notFound(`No se encontro una temporada activa`);
    }
    return season;
  }

  async advancePeriod() {
    const season = await models.Season.findOne({ where: { isActive: true } });
    if (!season) {
      throw boom.notFound(`No se encontro la temporada activa`);
    }
    switch(season.periodId){
      case(1):
        season.periodId = 2;
        break;
      case(2):
        season.periodId = 3;
        break;
      case(3):
        season.isActive = false;
        season.isCompleted = true;

        const nextSeason = await models.Season.findOne({ where: { name: season.id + 1 } });
        if (!nextSeason) {
          throw boom.notFound(`No se encontro la temporada siguiente`);
        }
        nextSeason.isActive = true;
        await nextSeason.save();

        break;
    }
    await season.save();
  }

  async findOne(id) {
    const season = await models.Season.findByPk(id, {
      include: ['period']
    });
    if (!season) {
      throw boom.notFound(`No se encontro la temporada con id ${id}`);
    }
    return season;
  }

  async update(id, changes) {
    const season = await models.Season.findByPk(id, {
      include: ['period']
    });
    if (!season) {
      throw boom.notFound(`No se encontro la temporada con id ${id}`);
    }
    const updatedSeason = await season.update(changes);
    return updatedSeason;
  }

  async delete(id) {
    const season = await models.Season.findByPk(id);
    if (!season) {
      throw boom.notFound(`No se encontro la temporada con id ${id}`);
    }
    await season.destroy();
    return { message: `Temporada con id ${id} eliminada`};
  }
}

module.exports = SeasonService;
