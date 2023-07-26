const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().min(1).max(255).valid('Liga', 'Kempesita', 'Copa', 'Supercopa');

const createCompetitionTypeSchema = Joi.object({
  name: name.required(),
});

const updateCompetitionTypeSchema = Joi.object({
  name,
});

const getCompetitionTypeSchema = Joi.object({
  id: id.required(),
});

module.exports = { createCompetitionTypeSchema, updateCompetitionTypeSchema, getCompetitionTypeSchema };
