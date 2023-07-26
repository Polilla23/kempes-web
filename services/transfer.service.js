const { Op } = require('sequelize');
const boom = require('@hapi/boom');
const schema = require('./../schemas/transfer.schema');

const { models } = require ('./../libs/sequelize');

class TransferService {
  constructor() {}

  async create(data) {
    const transfer = await models.Transfer.create(data);
    return transfer;
  }

  async find(query) {
    const options = {
      include: [
        {
          model: models.TransferType,
          as: 'transferType',
          attributes: ['name', 'id']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'buyerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'sellerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Season,
          as: 'season',
          attributes: ['name', 'id']
        },
        {
          model: models.Period,
          as: 'period',
          attributes: ['name', 'id']
        },
      ],
      where: {}
    };

    const { limit, offset } = query;
    if (limit && offset) {
      options.limit = limit;
      options.offset = offset;
    }

    const { amount } = query;
    if (amount) {
      options.where.amount = amount;
    }

    const { status } = query;
    if (status) {
      options.where.status = status;
    }

    const { amount_min, amount_max } = query;
    if (amount_min && amount_max) {
      options.where.amount = {
        [Op.between]: [amount_min, amount_max]
      };
    } else if (amount_min) {
      options.where.amount = {
        [Op.gte]: amount_min
      };
    } else if (amount_max) {
      options.where.amount = {
        [Op.lte]: amount_max
      };
    }

    const { playerId, seasonId, buyerTeamId, sellerTeamId } = query;
    if (playerId && seasonId && buyerTeamId && sellerTeamId) {
      options.where.playerId = playerId;
      options.where.seasonId = seasonId;
      options.where.buyerTeamId = buyerTeamId;
      options.where.sellerTeamId = sellerTeamId;
    } else if (playerId && seasonId && buyerTeamId) {
      options.where.playerId = playerId;
      options.where.seasonId = seasonId;
      options.where.buyerTeamId = buyerTeamId;
    } else if (playerId && seasonId && sellerTeamId) {
      options.where.playerId = playerId;
      options.where.seasonId = seasonId;
      options.where.sellerTeamId = sellerTeamId;
    } else if (playerId && seasonId) {
      options.where.playerId = playerId;
      options.where.seasonId = seasonId;
    } else if (playerId && buyerTeamId && sellerTeamId) {
      options.where.playerId = playerId;
      options.where.buyerTeamId = buyerTeamId;
      options.where.sellerTeamId = sellerTeamId;
    } else if (playerId && buyerTeamId) {
      options.where.playerId = playerId;
      options.where.buyerTeamId = buyerTeamId;
    } else if (playerId && sellerTeamId) {
      options.where.playerId = playerId;
      options.where.sellerTeamId = sellerTeamId;
    } else if (seasonId && buyerTeamId && sellerTeamId) {
      options.where.seasonId = seasonId;
      options.where.buyerTeamId = buyerTeamId;
      options.where.sellerTeamId = sellerTeamId;
    } else if (seasonId && buyerTeamId) {
      options.where.seasonId = seasonId;
      options.where.buyerTeamId = buyerTeamId;
    } else if (seasonId && sellerTeamId) {
      options.where.seasonId = seasonId;
      options.where.sellerTeamId = sellerTeamId;
    } else if (buyerTeamId && sellerTeamId) {
      options.where.buyerTeamId = buyerTeamId;
      options.where.sellerTeamId = sellerTeamId;
    } else if (playerId) {
      options.where.playerId = playerId;
    } else if (seasonId) {
      options.where.seasonId = seasonId;
    } else if (buyerTeamId) {
      options.where.buyerTeamId = buyerTeamId;
    } else if (sellerTeamId) {
      options.where.sellerTeamId = sellerTeamId;
    }

    const { seasonId_min, seasonId_max } = query;
    if (seasonId_min && seasonId_max) {
      options.where.seasonId = {
        [Op.between]: [seasonId_min, seasonId_max]
      };
    } else if (seasonId_min) {
      options.where.seasonId = {
        [Op.gte]: seasonId_min
      };
    } else if (seasonId_max) {
      options.where.seasonId = {
        [Op.lte]: seasonId_max
      };
    }

    const { endLoanSeasonId , endLoanPeriodId } = query;
    if (endLoanSeasonId && endLoanPeriodId) {
      options.where.endLoanSeasonId = endLoanSeasonId;
      options.where.endLoanPeriodId = endLoanPeriodId;
    } else if (endLoanSeasonId) {
      options.where.endLoanSeasonId = endLoanSeasonId;
    } else if (endLoanPeriodId) {
      options.where.endLoanPeriodId = endLoanPeriodId;
    }

    const transfers = await models.Transfer.findAll(options);
    return transfers;
  }

  async findLastTransfersFirst(){
    const transfer = await models.Transfer.findAll({
      order: [[ 'createdAt', 'DESC' ]],
      include: [
        {
          model: models.TransferType,
          as: 'transferType',
          attributes: ['name', 'id']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'buyerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'sellerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Season,
          as: 'season',
          attributes: ['name', 'id']
        }
      ],
    });
    if (!transfer) {
      throw boom.notFound(`No se encontro ninguna transferencia antigua`);
    }
    return transfer;
  }

  async findTransferBySeasonId(seasonId){
    const transfer = await models.Transfer.findAll({
      where: {
        seasonId: seasonId
      },
      include: [
        {
          model: models.TransferType,
          as: 'transferType',
          attributes: ['name', 'id']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'buyerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'sellerTeam',
          attributes: ['name', 'id']
        }
      ],
    });
    if (!transfer) {
      throw boom.notFound(`No se encontro ninguna transferencia para la temporada ${seasonId.name}`);
    }
    return transfer;
  }

  async findTransferByPlayerId(playerId){
    const transfer = await models.Transfer.findAll({
      where: {
        playerId: playerId
      },
      include: [
        {
          model: models.TransferType,
          as: 'transferType',
          attributes: ['name', 'id']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'buyerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'sellerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Season,
          as: 'season',
          attributes: ['name', 'id']
        }
      ],
      order: [[{ model: models.Season, as: 'season' }, 'name', 'DESC']]
    });
    if (!transfer) {
      throw boom.notFound(`No se encontro ninguna transferencia para el jugador ${playerId.name}`);
    }
    return transfer;
  }

  async findTransferByBuyerTeamId(buyerTeamId){
    const transfer = await models.Transfer.findAll({
      where: {
        buyerTeamId: buyerTeamId
      },
      include: [
        {
          model: models.TransferType,
          as: 'transferType',
          attributes: ['name', 'id']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'sellerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Season,
          as: 'season',
          attributes: ['name', 'id']
        }
      ],
      order: ['amount'],
    });
    if (!transfer) {
      throw boom.notFound(`No se encontro ninguna transferencia para el equipo ${buyerTeamId.name}`);
    }
    return transfer;
  }

  async findTransferBySellerTeamId(sellerTeamId){
    const transfer = await models.Transfer.findAll({
      where: {
        sellerTeamId: sellerTeamId
      },
      include: [
        {
          model: models.TransferType,
          as: 'transferType',
          attributes: ['name', 'id']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'buyerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Season,
          as: 'season',
          attributes: ['name', 'id']
        }
      ],
      order: ['amount'],
    });
    if (!transfer) {
      throw boom.notFound(`No se encontro ninguna transferencia para el equipo ${sellerTeamId.name}`);
    }
    return transfer;
  }

  async findOne(id) {
    const transfer = await models.Transfer.findByPk(id, {
      include: [
        {
          model: models.TransferType,
          as: 'transferType',
          attributes: ['name', 'id']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'buyerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'sellerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Season,
          as: 'season',
          attributes: ['name', 'id']
        }
      ]
    });
    if (!transfer) {
      throw boom.notFound(`No se encontro la transferencia con id ${id}`);
    }
    return transfer;
  }

  async update(id, changes) {
    const transfer = await models.Transfer.findByPk(id, {
      include: [
        {
          model: models.TransferType,
          as: 'transferType',
          attributes: ['name', 'id']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'buyerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Team,
          as: 'sellerTeam',
          attributes: ['name', 'id']
        },
        {
          model: models.Season,
          as: 'season',
          attributes: ['name', 'id']
        }
      ]
    });
    if (!transfer) {
      throw boom.notFound(`No se encontro la transferencia con id ${id}`);
    }
    const updatedTransfer = await transfer.update(changes);
    return updatedTransfer;
  }

  async delete(id) {
    const transfer = await models.Transfer.findByPk(id);
    if (!transfer) {
      throw boom.notFound(`No se encontro la transferencia con id ${id}`);
    }
    await transfer.destroy();
    return { message: `Transferencia con id ${id} eliminada`};
  }

  async getAllPendingTransfers() {
    const pendingTransfers = await models.Transfer.findAll({where: {status: 'pendiente'}});
    return pendingTransfers;
  }

  async confirmTransfer(id) {
    const pendingTransfers = await models.Transfer.findByPk({where: {status: 'pendiente'}});

    if(pendingTransfers.length === 0) {
      return { message: `No hay transferencia con id ${id} pendiente` };
    } else {
      for (const transfer of pendingTransfers) {

        const newStatus = 'confirmada';
        const validationStatus = schema.status.validate(newStatus);

        if(validationStatus.error) {
          throw boom.badRequest(validationStatus.error);
        }

        transfer.status = newStatus;
        await transfer.save();
        const player = await models.Player.findByPk(transfer.playerId);
        if (transfer.transferTypeId === 1 || transfer.transferTypeId === 3) {
          player.currentTeamId = transfer.buyerTeamId;
          player.ownerTeamId = transfer.buyerTeamId;
          player.payingSalaryTeamId = transfer.buyerTeamId;
        } else if (transfer.transferTypeId === 2) {
          player.currentTeamId = transfer.buyerTeamId;
          player.payingSalaryTeamId = transfer.buyerTeamId;
        }
        await player.save();
      }
    }
    return { message: 'Transferencia confirmada' };
  }

  async finishLoan() {
    const loanTransfers = await models.Transfer.findAll({where: {transferTypeId: 2}});

    if(loanTransfers.length === 0) {
      throw boom.notFound('No hay prestamos activos');
    }

    if(loanTransfers.transferTypeId !== 2) {
      throw boom.notFound('La transferencia no es una cesion');
    }

    if(loansTransfers.status !== 'confirmada') {
      throw boom.notFound('La cesion no esta confirmada');
    }

    for (const loanTransfer of loanTransfers) {
      const player = await models.Player.findByPk(loanTransfer.playerId);
      player.currentTeamId = loanTransfer.sellerTeamId;
      if(payingSalaryTeamId !== loanTransfer.sellerTeamId) {
        player.payingSalaryTeamId = loanTransfer.sellerTeamId;
      }
      await player.save();

      const newStatus = 'finalizada';
      const validationStatus = schema.status.validate(newStatus);

      if(validationStatus.error) {
        throw boom.badRequest(validationStatus.error);
      }

      transfer.status = newStatus;
      await transfer.save();

    }
    return { message: 'Prestamos finalizados' };
  }

  async cancelTransfer(id) {
    const pendingTransfer = await models.Transfer.findByPk(id, {where: {status: 'pendiente'}});
    if (!pendingTransfer) {
      throw boom.notFound(`No se encontro la transferencia con id ${id}`);
    }
    const newStatus = 'cancelada';
    const validationStatus = schema.status.validate(newStatus);

    if(validationStatus.error) {
      throw boom.badRequest(validationStatus.error);
    }

    pendingTransfer.status = newStatus;
    await pendingTransfer.save();
    return { message: `Transferencia con id ${id} cancelada`};
  }
}

module.exports = TransferService;
