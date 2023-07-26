const { Op } = require('sequelize');
const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class PlayerService {
  constructor() {}

  async create(data) {
    const player = await models.Player.create(data);
    return player;
  }

  async find(query) {
    const options = {
      include: [
        {
          model: models.Team,
          as: 'currentTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'ownerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'payingSalaryTeam',
          attributes: ['name', 'id']
        }
      ],
      where: {}
    };

    const { limit, offset } = query;
    if (limit && offset) {
      options.limit = limit;
      options.offset = offset;
    }

    const { name } = query;
    if (name) {
      options.where.name = {
        [Op.like]: `%${name}%`
      };
    }

    const { currentTeamId } = query;
    if (currentTeamId) {
      options.where.currentTeamId = currentTeamId;
    }

    const { ownerTeamId } = query;
    if (ownerTeamId) {
      options.where.ownerTeamId = ownerTeamId;
    }

    const { salary } = query;
    if (salary) {
      options.where.salary = salary;
    }

    const { position } = query;
    if (position) {
      const positions = Array.isArray(position) ? position : [position];
      options.where.position = {
        [Op.or]: positions.map(pos => ({ [Op.eq]: pos }))
      };
    }

    const { salary_min, salary_max } = query;
    if (salary_min && salary_max) {
      options.where.salary = {
        [Op.between]: [salary_min, salary_max]
      };
    } else if (salary_min) {
      options.where.salary = {
        [Op.gte]: salary_min
      };
    } else if (salary_max) {
      options.where.salary = {
        [Op.lte]: salary_max
      };
    }

    const { overall } = query;
    if (overall) {
      options.where.overall = overall;
    }

    const { overall_min, overall_max } = query;
    if (overall_min && overall_max) {
      options.where.overall = {
        [Op.between]: [overall_min, overall_max]
      };
    } else if (overall_min) {
      options.where.overall = {
        [Op.gte]: overall_min
      };
    } else if (overall_max) {
      options.where.overall = {
        [Op.lte]: overall_max
      };
    }

    const players = await models.Player.findAll(options);
    return players;
  }

  async findOne(id) {
    const player = await models.Player.findByPk(id, {
      include: [
        {
          model: models.Team,
          as: 'currentTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'ownerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'payingSalaryTeam',
          attributes: ['name', 'id']
        }
      ],
      where: {}
    });
    if (!player) {
      throw boom.notFound(`No se encontro el jugador con id ${id}`);
    }
    return player;
  }

  async findPlayersByCurrentTeamId(teamId) {
    const players = await models.Player.findAll({
      include: [
        {
          model: models.Team,
          as: 'currentTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'ownerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'payingSalaryTeam',
          attributes: ['name', 'id']
        }
      ],
      where: {
        currentTeamId: teamId
      }
    });
    return players;
  }

  async findPlayersByOwnerId(ownerId) {
    const players = await models.Player.findAll({
      include: [
        {
          model: models.Team,
          as: 'currentTeam',
          attributes: ['name']
        },
        {
          model: models.Team,
          as: 'ownerTeam',
          attributes: ['name']
        },
        {
          model: models.Team,
          as: 'payingSalaryTeam',
          attributes: ['name']
        }
      ],
      where: {
        ownerTeamId: ownerId
      }
    });
    return players;
  }

  async findPlayersByPayingSalaryTeamId(payingSalaryTeamId) {
    const players = await models.Player.findAll({
      include: [
        {
          model: models.Team,
          as: 'currentTeam',
          attributes: ['name']
        },
        {
          model: models.Team,
          as: 'ownerTeam',
          attributes: ['name']
        },
        {
          model: models.Team,
          as: 'payingSalaryTeam',
          attributes: ['name']
        }
      ],
      where: {
        payingSalaryTeamId: payingSalaryTeamId
      }
    });
    return players;
  }

  async update(id, changes) {
    const player = await models.Player.findByPk(id, {
      include: [
        {
          model: models.Team,
          as: 'currentTeam',
          attributes: ['name']
        },
        {
          model: models.Team,
          as: 'ownerTeam',
          attributes: ['name']
        },
        {
          model: models.Team,
          as: 'payingSalaryTeam',
          attributes: ['name']
        }
      ],
      where: {}
    });
    if (!player) {
      throw boom.notFound(`No se encontro el jugador con id ${id}`);
    }
    const updatedPlayer = await player.update(changes);
    return updatedPlayer;
  }

  async delete(id) {
    const player = await models.Player.findByPk(id);
    if (!player) {
      throw boom.notFound(`No se encontro el jugador con id ${id}`);
    }
    await player.destroy();
    return { message: `Jugador con id ${id} eliminado`};
  }
}

module.exports = PlayerService;
