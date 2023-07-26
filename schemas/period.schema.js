const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(50).valid('Inicial', 'Mitad', 'Final');

const createPeriodSchema = Joi.object({
  name: name.required(),
});

const updatePeriodSchema = Joi.object({
  name,
});

const getPeriodSchema = Joi.object({
  id: id.required(),
});

module.exports = { createPeriodSchema, updatePeriodSchema, getPeriodSchema };
