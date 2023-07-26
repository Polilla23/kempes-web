const Joi = require('joi');

const id = Joi.number().integer();
const homeTeamGoals = Joi.number().integer();
const awayTeamGoals = Joi.number().integer();
const competitionId = Joi.number().integer();
const homeTeamId = Joi.number().integer();
const awayTeamId = Joi.number().integer();
const status = Joi.string().valid('pendiente', 'jugado', 'nulo');

const createMatchSchema = Joi.object({
  homeTeamGoals: homeTeamGoals,
  awayTeamGoals: awayTeamGoals,
  competitionId: competitionId.required(),
  homeTeamId: homeTeamId.required(),
  awayTeamId: awayTeamId.required(),
  status,
});

const updateMatchSchema = Joi.object({
  homeTeamGoals: homeTeamGoals,
  awayTeamGoals: awayTeamGoals,
  competitionId: competitionId,
  homeTeamId: homeTeamId,
  awayTeamId: awayTeamId,
  status: status,
});

const getMatchSchema = Joi.object({
  id: id.required(),
});

const queryMatchSchema = Joi.object({
  competitionId,
  homeTeamId,
  awayTeamId,
  status,
});

module.exports = { createMatchSchema, updateMatchSchema, getMatchSchema, queryMatchSchema };
