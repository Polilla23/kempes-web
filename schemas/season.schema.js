const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(50).valid().regex(/^Temporada\s/);
const isCompleted = Joi.boolean();
const isActive = Joi.boolean();
const periodId = Joi.number().integer();

const createSeasonSchema = Joi.object({
  name: name.required(),
  isCompleted,
  isActive,
  periodId,
});

const updateSeasonSchema = Joi.object({
  name,
  isCompleted,
  isActive,
  periodId,
});

const getSeasonSchema = Joi.object({
  id: id.required(),
});

module.exports = { createSeasonSchema, updateSeasonSchema, getSeasonSchema };
