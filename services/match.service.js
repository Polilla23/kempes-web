const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class MatchService {
  constructor() {}

  async create(data) {
    const match = await models.Match.create(data);
    return match;
  }

  async find(query) {
    const options = {
      include: [
      {
        model: models.Team,
        as: 'homeTeam',
        attributes: ['name', 'id']
      },
      {
        model: models.Team,
        as: 'awayTeam',
        attributes: ['name', 'id']
      },
      {
        model: models.Competition,
        as: 'competition',
        attributes: ['name', 'id'],
        include: {
          model: models.Season,
          as: 'season',
          attributes: ['name', 'id']
        }
      }],
      where: {}
    };

    const { competitionId } = query;
    if (competitionId) {
      options.where.competitionId = competitionId;
    }

    const { seasonId } = query;
    if (seasonId) {
      options.where.seasonId = seasonId;
    }

    const { homeTeamId } = query;
    if (homeTeamId) {
      options.where.homeTeamId = homeTeamId;
    }

    const { awayTeamId } = query;
    if (awayTeamId) {
      options.where.awayTeamId = awayTeamId;
    }

    const { status } = query;
    if (status) {
      options.where.status = status;
    }

    const matches = await models.Match.findAll(options);
    return matches;
  }

  async findOne(id) {
    const match = await models.Match.findByPk(id, {
      include: [
        {
          model: models.Team,
          as: 'homeTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'awayTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Competition,
          as: 'competition',
          attributes: ['name', 'id'],
          include: {
            model: models.Season,
            as: 'season',
            attributes: ['name', 'id']
          }
        }]
    });
    if (!match) {
      throw boom.notFound(`No se encontro el partido con id ${id}`);
    }
    return match;
  }

  async update(id, changes) {
    const match = await models.Match.findByPk(id);
    if (!match) {
      throw boom.notFound(`No se encontro el partido con id ${id}`);
    }
    const updatedMatch = await match.update(changes);
    return updatedMatch;
  }

  async delete(id) {
    const match = await models.Match.findByPk(id);
    if (!match) {
      throw boom.notFound(`No se encontro el partido con id ${id}`);
    }
    await match.destroy();
    return { message: `Partido con id ${id} eliminado`};
  }
}

module.exports = MatchService;
