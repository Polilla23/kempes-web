const express = require('express');

const PeriodService = require('../services/period.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createPeriodSchema, updatePeriodSchema, getPeriodSchema } = require('../schemas/period.schema');

const router = express.Router();
const service = new PeriodService();

router.get('/', async (req, res, next) => {
  try {
    const periods = await service.find();
    res.json(periods);
  } catch (err) {
    next(err);
  }
});

router.get('/:id',
  validatorHandler(getPeriodSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const period = await service.findOne(id);
      res.json(period);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createPeriodSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    try {
      const newPeriod = await service.create(body);
      res.status(201).json(newPeriod);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validatorHandler(getPeriodSchema, 'params'),
  validatorHandler(updatePeriodSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedPeriod = await service.update(id, body);
      res.json(updatedPeriod);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getPeriodSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedPeriod = await service.delete(id);
      res.json(deletedPeriod);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
