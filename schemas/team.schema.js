const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(50);
const userId = Joi.number().integer();
const balanceId = Joi.number().integer();
const isActive = Joi.boolean();
const image = Joi.string();

const createTeamSchema = Joi.object({
  name: name.required(),
  userId: userId.required(),
  balanceId: balanceId.required(),
  isActive: isActive.required(),
  image,
});

const updateTeamSchema = Joi.object({
  name,
  userId,
  balanceId,
  isActive,
  image
});

const getTeamSchema = Joi.object({
  id: id.required(),
});

module.exports = { createTeamSchema, updateTeamSchema, getTeamSchema };
