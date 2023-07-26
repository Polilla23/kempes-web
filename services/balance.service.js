const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class BalanceService {
  constructor() {}

  async create(data) {
    const balance = await models.Balance.create(data);
    return balance;
  }

  async findByTeamId(teamId) {
    const balance = await models.Balance.findOne({
      where: {
        '$team.id$': teamId },
      include: [
        {
          association: 'team',
          include: ['user']
        }
      ]
    });
    if (!balance) {
      throw boom.notFound(`No se encontro el balance del equipo con id ${teamId}`);
    }
    return balance;
  }

  async find() {
    const balances = await models.Balance.findAll({
      include: [
        {
          association: 'team',
          include: ['user']
        }
      ]
    });
    return balances;
  }

  async findOne(id) {
    const balance = await models.Balance.findByPk(id, {
      include: [
        {
          association: 'team',
          include: ['user']
        }
      ]
    });
    if (!balance) {
      throw boom.notFound(`No se encontro el balance con id ${id}`);
    }
    return balance;
  }

  async update(id, changes) {
    const balance = await models.Balance.findByPk(id);
    if (!balance) {
      throw boom.notFound(`No se encontro el balance con id ${id}`);
    }
    const rta = await balance.update(changes);
    return rta;
  }

  async updateByTeamId(teamId, changes) {
    const balance = await models.Balance.findOne({
      where: {
        '$team.id$': teamId },
      include: [
        {
          association: 'team',
          include: ['user']
        }
      ]
    });
    if (!balance) {
      throw boom.notFound(`No se encontro el balance del equipo con id ${teamId}`);
    }
    const rta = await balance.update(changes);
    return rta;
  }

  async delete(id) {
    const balance = await models.Balance.findByPk(id);
    if (!balance) {
      throw boom.notFound(`No se encontro el balance con id ${id}`);
    }
    await balance.destroy();
    return { message: `Balance con id ${id} eliminado`};
  }
}

module.exports = BalanceService;
