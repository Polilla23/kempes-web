const express = require('express');

const MatchService = require('../services/balance.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createBalanceSchema, updateBalanceSchema, getBalanceSchema } = require('../schemas/balance.schema');

const router = express.Router();
const service = new MatchService();

router.get('/', async (req, res, next) => {
  try {
    const balances = await service.find();
    res.json(balances);
  } catch (err) {
    next(err);
  }
});

router.get('/team/:id',
  validatorHandler(getBalanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const balance = await service.findByTeamId(id);
      res.json(balance);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id',
  validatorHandler(getBalanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const balance = await service.findOne(id);
      res.json(balance);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createBalanceSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newBalance = await service.create(body);
      res.status(201).json(newBalance);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validatorHandler(getBalanceSchema, 'params'),
  validatorHandler(updateBalanceSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedBalance = await service.update(id, body);
      res.json(updatedBalance);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/team/:id',
  validatorHandler(getBalanceSchema, 'params'),
  validatorHandler(updateBalanceSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedBalance = await service.updateByTeamId(id, body);
      res.json(updatedBalance);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getBalanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedBalance = await service.delete(id);
      res.json(deletedBalance);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
