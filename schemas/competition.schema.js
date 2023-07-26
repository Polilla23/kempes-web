const Joi  = require('joi');

const id = Joi.number().integer();
const name = Joi.string().min(1).max(255).valid('Liga A', 'Liga B', 'Liga C', 'Liga D', 'Liga E', 'Kempesita A', 'Kempesita B', 'Kempesita C', 'Kempesita D', 'Kempesita E' ,'Copa Kempes', 'Copa de Oro', 'Copa de Plata', 'Copa de Bronce', 'Supercopa');
const isCompleted = Joi.boolean();
const isActive = Joi.boolean();
const seasonId = Joi.number().integer();
const competitionTypeId = Joi.number().integer();
const teamId = Joi.number().integer();

const createCompetitionSchema = Joi.object({
  name: name.required(),
  isCompleted: isCompleted.required(),
  isActive: isActive.required(),
  seasonId: seasonId.required(),
  competitionTypeId: competitionTypeId.required(),
});

const updateCompetitionSchema = Joi.object({
  name,
  isCompleted,
  isActive,
  seasonId,
  competitionTypeId,
});

const getCompetitionSchema = Joi.object({
  id: id.required(),
});

const addTeamToCompetitionSchema = Joi.object({
  competitionId: id.required(),
  teamId: teamId.required(),
});

const updateCompetitionTeamSchema = Joi.object({
  competitionId: id,
  teamId,
});

module.exports = { createCompetitionSchema, updateCompetitionSchema, getCompetitionSchema, addTeamToCompetitionSchema, updateCompetitionTeamSchema };
