const Joi = require('joi');

const id = Joi.number().integer();
const amount = Joi.number().integer();
const status = Joi.string().valid('pendiente', 'pagada', 'cancelada');
const transferId = Joi.number().integer();
const seasonId = Joi.number().integer();
const periodId = Joi.number().integer();

const createInstallmentSchema = Joi.object({
  amount: amount.required(),
  status,
  transferId: transferId.required(),
  seasonId: seasonId.required(),
  periodId: periodId.required(),
});

const updateInstallmentSchema = Joi.object({
  amount,
  status,
  transferId,
  seasonId,
  periodId,
});

const getInstallmentSchema = Joi.object({
  id: id.required(),
});

module.exports = { createInstallmentSchema, updateInstallmentSchema, getInstallmentSchema };
