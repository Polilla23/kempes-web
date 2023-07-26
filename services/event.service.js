const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class EventService {
  constructor() {}

  async create(data) {
    const event = await models.Event.create(data);
    return event;
  }

  async find() {
    const events = await models.Event.findAll({
      include: [
        {
          model: models.EventType,
          as: 'eventType',
          attributes: ['name']
        },
        {
          model: models.Match,
          as: 'match',
          attributes: ['id']
        },
        {
          model: models.Team,
          as: 'team',
          attributes: ['name']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'lastName', 'id']
        }
      ]
    });
    return events;
  }

  async findByMatchId(matchId) {
    const events = await models.Event.findAll({
      where: {
        '$match.id$': matchId
      },
      include: [
        {
          model: models.EventType,
          as: 'eventType',
          attributes: ['name']
        },
        {
          model: models.Match,
          as: 'match',
          attributes: ['id']
        },
        {
          model: models.Team,
          as: 'team',
          attributes: ['name']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'lastName', 'id']
        }
      ]
    });
    if(!events) {
      throw boom.notFound(`No se encontraron eventos para el partido con id ${matchId}`);
    }
    return events;
  }

  async findByPlayerId(playerId) {
    const events = await models.Event.findAll({
      where: {
        '$player.id$': playerId
      },
      include: [
        {
          model: models.EventType,
          as: 'eventType',
          attributes: ['name']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'lastName']
        },
        {
          model: models.Team,
          as: 'team',
          attributes: ['name']
        },
        {
          model: models.Match,
          as: 'match',
          attributes: ['id'],
          include: [
            {
              model: models.Competition,
              as: 'competition',
              attributes: ['name', 'id'],
              include: [
                {
                  model: models.Season,
                  as: 'season',
                  attributes: ['name', 'id']
                }
              ]
            },
          ]
        }
      ]
    });
    if(!events) {
      throw boom.notFound(`No se encontraron eventos para el jugador con id ${playerId}`);
    }
    return events;
  }

  async findByTeamId(teamId) {
    const events = await models.Event.findAll({
      where: {
        '$team.id$': teamId
      },
      include: [
        {
          model: models.EventType,
          as: 'eventType',
          attributes: ['name']
        },
        {
          model: models.Team,
          as: 'team',
          attributes: ['name']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'lastName']
        },
        {
          model: models.Match,
          as: 'match',
          attributes: ['id'],
          include: [
            {
              model: models.Competition,
              as: 'competition',
              attributes: ['name', 'id'],
              include: [
                {
                  model: models.Season,
                  as: 'season',
                  attributes: ['name', 'id']
                }
              ]
            },
          ]
        }
      ]
    });
    if(!events) {
      throw boom.notFound(`No se encontraron eventos para el equipo con id ${teamId}`);
    }
    return events;
  }

  async findGoalsByTeamId(teamId) {
    const events = await models.Event.findAll({
      where: {
        '$team.id$': teamId,
        '$eventType.name$': 'Gol'
      },
      include: [
        {
          model: models.Team,
          as: 'team',
          attributes: ['name']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'lastName']
        },
        {
          model: models.Match,
          as: 'match',
          attributes: ['id'],
          include: [
            {
              model: models.Competition,
              as: 'competition',
              attributes: ['name', 'id'],
              include: [
                {
                  model: models.Season,
                  as: 'season',
                  attributes: ['name', 'id']
                }
              ]
            },
          ]
        },
        {
          model: models.EventType,
          as: 'eventType',
          attributes: ['name']
        }
      ]
    });
    if(!events) {
      throw boom.notFound(`No se encontraron goles para el equipo con id ${teamId}`);
    }
    return events;
  }

  async findOne(id) {
    const event = await models.Event.findByPk(id, {
      include: [
        {
          model: models.EventType,
          as: 'eventType',
          attributes: ['name']
        },
        {
          model: models.Match,
          as: 'match',
          attributes: ['id']
        },
        {
          model: models.Team,
          as: 'team',
          attributes: ['name']
        },
        {
          model: models.Player,
          as: 'player',
          attributes: ['name', 'lastName', 'id']
        }
      ]
    });
    if (!event) {
      throw boom.notFound(`No se encontro el evento con id ${id}`);
    }
    return event;
  }

  async update(id, changes) {
    const event = await models.Event.findByPk(id);
    if (!event) {
      throw boom.notFound(`No se encontro el evento con id ${id}`);
    }
    const updatedEvent = await event.update(changes);
    return updatedEvent;
  }

  async delete(id) {
    const event = await models.Event.findByPk(id);
    if (!event) {
      throw boom.notFound(`No se encontro el evento con id ${id}`);
    }
    await event.destroy();
    return { message: `Evento con id ${id} eliminado`};
  }
}

module.exports = EventService;
