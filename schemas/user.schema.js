const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(50);
const email = Joi.string().email();
const password = Joi.string().min(8).max(50);
const role = Joi.string().valid('user', 'admin');


const createUserSchema = Joi.object({
  name: name.required(),
  email: email.required(),
  password: password.required(),
  role,
});

const updateUserSchema = Joi.object({
  name,
  email,
  role
});

const getUserSchema = Joi.object({
  id: id.required(),
});

module.exports = { createUserSchema, updateUserSchema, getUserSchema };
