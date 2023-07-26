const boom = require('@hapi/boom');

const { models } = require ('./../libs/sequelize');

class EventTypeService {
  constructor() {}

  async create(data) {
    const eventType = await models.EventType.create(data);
    return eventType;
  }

  async find() {
    const eventTypes = await models.EventType.findAll();
    return eventTypes;
  }

  async findOne(id) {
    const eventType = await models.EventType.findByPk(id);
    if (!eventType) {
      throw boom.notFound(`No se encontro el tipo de evento con id ${id}`);
    }
    return eventType;
  }

  async update(id, changes) {
    const eventType = await models.EventType.findByPk(id);
    if (!eventType) {
      throw boom.notFound(`No se encontro el tipo de evento con id ${id}`);
    }
    const updatedEventType = await eventType.update(changes);
    return updatedEventType;
  }

  async delete(id) {
    const eventType = await models.EventType.findByPk(id);
    if (!eventType) {
      throw boom.notFound(`No se encontro el tipo de evento con id ${id}`);
    }
    await eventType.destroy();
    return { message: `Tipo de evento con id ${id} eliminado`};
  }
}

module.exports = EventTypeService;
