const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class InstallmentService {
  constructor() {}

  async create(data) {
    const installment = await Installment.create(data);
    return installment;
  }

  async find(){
    const installment = await Installment.findAll({
      include: [
        {
          model: models.Transfer,
          as: 'transfer',
          attributes: ['id', 'status', 'sellerTeamId', 'buyerTeamId'],
          include: [
            {
              model: models.Team,
              as: 'sellerTeam',
              attributes: ['id', 'name'],
            },
            {
              model: models.Team,
              as: 'buyerTeam',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: models.Season,
          as: 'season',
          attributes: ['id', 'name'],
        },
        {
          model: models.Period,
          as: 'period',
          attributes: ['id', 'name'],
        },
      ],
    });
    return installment;
  }

  async findOne(id) {
    const installment = await Installment.findByPk(id, {
      include: [
        {
          model: models.Transfer,
          as: 'transfer',
          attributes: ['id', 'status', 'sellerTeamId', 'buyerTeamId'],
          include: [
            {
              model: models.Team,
              as: 'sellerTeam',
              attributes: ['id', 'name'],
            },
            {
              model: models.Team,
              as: 'buyerTeam',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: models.Season,
          as: 'season',
          attributes: ['id', 'name'],
        },
        {
          model: models.Period,
          as: 'period',
          attributes: ['id', 'name'],
        },
      ],
    });
    if (!installment) {
      throw boom.notFound(`No se encontro la cuota con id ${id}`);
    }
    return installment;
  }

  async update(id, changes) {
    const transfer = await Installment.findByPk(id, {
      include: [
        {
          model: models.Transfer,
          as: 'transfer',
          attributes: ['id', 'status'],
        },
        {
          model: models.Season,
          as: 'season',
          attributes: ['id', 'name'],
        },
        {
          model: models.Period,
          as: 'period',
          attributes: ['id', 'name'],
        },
      ],
    });
    if (!transfer) {
      throw boom.notFound(`No se encontro la cuota con id ${id}`);
    }

    const installment = await Installment.update(changes);
    return installment;
  }

  async delete(id) {
    const installment = await Installment.findByPk(id);
    if (!installment) {
      throw boom.notFound(`No se encontro la cuota con id ${id}`);
    }
    await installment.destroy();
    return { message: `Cuota con id ${id} eliminada`};
  }
}

module.exports = InstallmentService;
