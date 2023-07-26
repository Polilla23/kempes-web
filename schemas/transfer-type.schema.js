const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().min(1).max(255).valid('Venta/Compra', 'Prestamo', 'Libre');

const createTransferTypeSchema = Joi.object({
  name: name.required(),
});

const updateTransferTypeSchema = Joi.object({
  name,
});

const getTransferTypeSchema = Joi.object({
  id: id.required(),
});

module.exports = { createTransferTypeSchema, updateTransferTypeSchema, getTransferTypeSchema };
