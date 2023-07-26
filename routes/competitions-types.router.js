const express = require('express');

const CompetitionTypeService = require('../services/competition-type.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createCompetitionTypeSchema, updateCompetitionTypeSchema, getCompetitionTypeSchema } = require('../schemas/competition-type.schema');

const router = express.Router();
const service = new CompetitionTypeService();

router.get('/', async (req, res, next) => {
  try {
    const competitionsTypes = await service.find();
    res.json(competitionsTypes);
  } catch (err) {
    next(err);
  }
});

router.get('/:id',
  validatorHandler(getCompetitionTypeSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const competitionType = await service.findOne(id);
      res.json(competitionType);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createCompetitionTypeSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCompetitionType = await service.create(body);
      res.status(201).json(newCompetitionType);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validatorHandler(getCompetitionTypeSchema, 'params'),
  validatorHandler(updateCompetitionTypeSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedCompetitionType = await service.update(id, body);
      res.json(updatedCompetitionType);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getCompetitionTypeSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedCompetitionType = await service.delete(id);
      res.json(deletedCompetitionType);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
