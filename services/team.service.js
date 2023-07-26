const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class TeamService{
  constructor () {}

  async create(data) {
    const team = await models.Team.create(data);
    return team;
  }

  async find() {
    const teams = await models.Team.findAll({
      include: [{
        model: models.Balance,
        as: 'balance',
      }]
    });
    return teams;
  }

  async findOne(id) {
    const team = await models.Team.findByPk(id, {
      include: [{
        model: models.Balance,
        as: 'balance',
      }]
    });
    if (!team) {
      throw boom.notFound(`No se encontro al equipo con id ${id}`);
    }
    return team;
  }

  async update(id, changes) {
    const team = await models.Team.findByPk(id);
    if (!team) {
      throw boom.notFound(`No se encontro al equipo con id ${id}`);
    }
    const rta = await team.update(changes);
    return rta;
  }

  async delete(id) {
    const team = await models.Team.findByPk(id);
    if (!team) {
      throw boom.notFound(`No se encontro al equipo con id ${id}`);
    }
    await team.destroy();
    return { message: `Equipo con id ${id} eliminado`};
  }
}

module.exports = TeamService;
