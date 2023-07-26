const Joi = require('joi');

const id = Joi.number().integer();
const transferTypeId = Joi.number().integer();
const status = Joi.string().valid('pendiente', 'confirmada', 'cancelada', 'finalizada');
const amount = Joi.number().integer();
const sellerTeamId = Joi.number().integer();
const buyerTeamId = Joi.number().integer();
const playerId = Joi.number().integer();
const seasonId = Joi.number().integer();
const periodId = Joi.number().integer();
const endLoanSeasonId = Joi.number().integer();
const endLoanPeriodId = Joi.number().integer();

const limit = Joi.number().integer().min(1).max(100);
const offset = Joi.number().integer().min(0);
const amount_min = Joi.number().integer();
const amount_max = Joi.number().integer();
const seasonId_min = Joi.number().integer();
const seasonId_max = Joi.number().integer();

const createTransferSchema = Joi.object({
  transferTypeId: transferTypeId.required(),
  status,
  amount: amount.required(),
  sellerTeamId: sellerTeamId.required(),
  buyerTeamId: buyerTeamId.required(),
  playerId: playerId.required(),
  seasonId: seasonId.required(),
  periodId: periodId.required(),
  endLoanSeasonId,
  endLoanPeriodId
});

const updateTransferSchema = Joi.object({
  transferTypeId,
  status,
  amount,
  sellerTeamId,
  buyerTeamId,
  playerId,
  seasonId,
  periodId,
  endLoanSeasonId,
  endLoanPeriodId
});

const getTransferSchema = Joi.object({
  id: id.required(),
});

const queryTransferSchema = Joi.object({
  status,
  limit,
  offset,
  amount,
  amount_min,
  amount_max,
  playerId,
  seasonId,
  buyerTeamId,
  sellerTeamId,
  seasonId_min,
  seasonId_max,
  endLoanSeasonId,
  endLoanPeriodId
});

module.exports = { createTransferSchema, updateTransferSchema, getTransferSchema, queryTransferSchema };
