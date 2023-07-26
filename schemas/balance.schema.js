const Joi = require('joi');

const id = Joi.number().integer();
const amount = Joi.number().integer();

const createBalanceSchema = Joi.object({
  amount: amount.required(),
});

const updateBalanceSchema = Joi.object({
  amount,
});

const getBalanceSchema = Joi.object({
  id: id.required(),
});

module.exports = { createBalanceSchema, updateBalanceSchema, getBalanceSchema };
