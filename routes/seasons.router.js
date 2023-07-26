const express = require('express');

const SeasonService = require('../services/season.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createSeasonSchema, updateSeasonSchema, getSeasonSchema } = require('../schemas/season.schema')

const router = express.Router();
const service = new SeasonService();

router.get('/', async (req, res, next) => {
  try {
    const seasons = await service.find();
    res.json(seasons);
  } catch (err) {
    next(err);
  }
});

router.get('/active',
  async (req, res, next) => {
    try {
      const season = await service.findActive();
      res.json(season);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id',
  validatorHandler(getSeasonSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const season = await service.findOne(id);
      res.json(season);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createSeasonSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    try {
      const newSeason = await service.create(body);
      res.status(201).json(newSeason);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/advance',
  async (req, res, next) => {
    try {
      const season = await service.advancePeriod();
      res.json(season);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validatorHandler(getSeasonSchema, 'params'),
  validatorHandler(updateSeasonSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedSeason = await service.update(id, body);
      res.json(updatedSeason);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getSeasonSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const deletedSeason = await service.delete(id);
      res.json(deletedSeason);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
