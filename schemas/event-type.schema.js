const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().min(1).max(255).valid('Gol', 'Asistencia', 'Amarilla', 'Roja', 'Lesion', 'MVP');

const createEventTypeSchema = Joi.object({
  name: name.required(),
});

const updateEventTypeSchema = Joi.object({
  name,
});

const getEventTypeSchema = Joi.object({
  id: id.required(),
});

module.exports = { createEventTypeSchema, updateEventTypeSchema, getEventTypeSchema };
