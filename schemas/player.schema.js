const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(50);
const lastName = Joi.string().max(50);
const birthday = Joi.date();
const position = Joi.string().valid('POR', 'CAR', 'LD', 'DFC', 'LI', 'MCD', 'MD', 'MC', 'MI', 'MCO', 'SDD', 'SD', 'SDI', 'ED', 'EI', 'DC');
const overall = Joi.number().integer().min(0).max(100);
const salary = Joi.number().integer().min(100.000);
const sofifaId = Joi.number().integer();
const transfermarktId = Joi.number().integer();
const isKempesita = Joi.boolean();
const currentTeamId = Joi.number().integer();
const ownerTeamId = Joi.number().integer();
const payingSalaryTeamId = Joi.number().integer();

const limit = Joi.number().integer().min(1).max(100);
const offset = Joi.number().integer().min(0);
const salary_min = Joi.number().integer().min(100.000);
const salary_max = Joi.number().integer().min(100.000);
const overall_min = Joi.number().integer().min(0).max(100);
const overall_max = Joi.number().integer().min(0).max(100);

const positions = Joi.array().items(position);

const createPlayerSchema = Joi.object({
  name: name.required(),
  lastName: lastName.required(),
  birthday: birthday.required(),
  position: position,
  overall: overall.required(),
  salary,
  sofifaId: sofifaId,
  transfermarktId: transfermarktId,
  isKempesita: isKempesita.required(),
  currentTeamId: currentTeamId.required(),
  ownerTeamId: ownerTeamId.required(),
  payingSalaryTeamId: payingSalaryTeamId.required(),
});

const updatePlayerSchema = Joi.object({
  name,
  lastName,
  birthday,
  position,
  overall,
  salary,
  sofifaId,
  transfermarktId,
  isKempesita,
  currentTeamId,
  ownerTeamId,
  payingSalaryTeamId,
});

const getPlayerSchema = Joi.object({
  id: id.required(),
});

const queryPlayerSchema = Joi.object({
  limit,
  offset,
  salary,
  salary_min,
  salary_max,
  overall,
  overall_min,
  overall_max,
  position: positions,
  name,
});

module.exports = { createPlayerSchema, updatePlayerSchema, getPlayerSchema, queryPlayerSchema };
