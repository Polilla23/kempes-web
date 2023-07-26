const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class CompetitionService {
  constructor() {}

  async create(data) {
    const competition = await models.Competition.create(data);
    return competition;
  }

  async addTeam(data) {
    const newTeamCompetition = await models.CompetitionTeam.create(data);
    return newTeamCompetition;
  }

  async find() {
    const competitions = await models.Competition.findAll({
      include: ['competitionType', 'season', 'teams']
    });
    return competitions;
  }

  async findCompetitionsActive() {
    const competitions = await models.Competition.findAll({
      where: {
        isActive: true
      },
      include: ['competitionType', 'season', 'teams']
    });
    return competitions;
  }

  async findOne(id) {
    const competition = await models.Competition.findByPk(id, {
      include: ['competitionType', 'season', 'teams']
    });
    if (!competition) {
      throw boom.notFound(`No se encontro la competencia con id ${id}`);
    }
    return competition;
  }

  async update(id, changes) {
    const competition = await models.Competition.findByPk(id);
    if (!competition) {
      throw boom.notFound(`No se encontro la competencia con id ${id}`);
    }
    const updatedCompetition = await competition.update(changes);
    return updatedCompetition;
  }

  async updateCompetitionTeam(id, changes) {
    const competitionTeam = await models.CompetitionTeam.findByPk(id);
    if (!competitionTeam) {
      throw boom.notFound(`No se encontro la competencia con id ${id}`);
    }
    const updatedCompetitionTeam = await competitionTeam.update(changes);
    return updatedCompetitionTeam;
  }

  async delete(id) {
    const competition = await models.Competition.findByPk(id);
    if (!competition) {
      throw boom.notFound(`No se encontro la competencia con id ${id}`);
    }
    await competition.destroy();
    return { message: `Competencia con id ${id} eliminada`};
  }
}

module.exports = CompetitionService;
