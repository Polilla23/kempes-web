const express = require('express');

const CompetitionService = require('../services/competition.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createCompetitionSchema, updateCompetitionSchema, getCompetitionSchema, addTeamToCompetitionSchema, updateCompetitionTeamSchema} = require('../schemas/competition.schema');

const router = express.Router();
const service = new CompetitionService();

router.get('/', async (req, res, next) => {
  try {
    const competitions = await service.find();
    res.json(competitions);
  } catch (err) {
    next(err);
  }
});

router.get('/active',
  async (req, res, next) => {
    try {
      const competitions = await service.findCompetitionsActive();
      res.json(competitions);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id',
  validatorHandler(getCompetitionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const competition = await service.findOne(id);
      res.json(competition);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createCompetitionSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCompetition = await service.create(body);
      res.status(201).json(newCompetition);
    }
    catch (err) {
      next(err);
    }
  }
);

router.post('/add-team',
  validatorHandler(addTeamToCompetitionSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newTeam = await service.addTeam(body);
      res.status(201).json(newTeam);
    }
    catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validatorHandler(getCompetitionSchema, 'params'),
  validatorHandler(updateCompetitionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedCompetition = await service.update(id, body);
      res.json(updatedCompetition);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/competition-team/:id',
  validatorHandler(getCompetitionSchema, 'params'),
  validatorHandler(updateCompetitionTeamSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedCompetitionTeam = await service.updateCompetitionTeam(id, body);
      res.json(updatedCompetitionTeam);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getCompetitionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedCompetition = await service.delete(id);
      res.json(deletedCompetition);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
