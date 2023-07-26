const express = require('express');

const UserService = require('./../services/user.service');
const validationHandler = require('./../middlewares/validator.handler');
const { createUserSchema, updateUserSchema, getUserSchema } = require('./../schemas/user.schema');

const router = express.Router();
const service = new UserService();

router.get('/', async (req, res, next) => {
  try {
    const users = await service.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get('/:id',
  validationHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await service.findOne(id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validationHandler(createUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newUser = await service.create(body);
      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validationHandler(getUserSchema, 'params'),
  validationHandler(updateUserSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedUser = await service.update(id, body);
      res.json(updatedUser);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validationHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({id});
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
