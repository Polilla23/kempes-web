const Joi = require('joi');

const id = Joi.number().integer();
const matchId = Joi.number().integer();
const teamId = Joi.number().integer();
const playerId = Joi.number().integer();
const eventTypeId = Joi.number().integer();
const quantity = Joi.number().integer();

const createEventSchema = Joi.object({
  matchId: matchId.required(),
  teamId: teamId.required(),
  playerId: playerId.required(),
  eventTypeId: eventTypeId.required(),
  quantity: quantity.required(),
});

const updateEventSchema = Joi.object({
  quantity,
  matchId,
  teamId,
  playerId,
  eventTypeId,
});

const getEventSchema = Joi.object({
  id: id.required(),
});

module.exports = { createEventSchema, updateEventSchema, getEventSchema };
