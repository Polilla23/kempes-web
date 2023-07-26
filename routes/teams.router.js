const express = require('express');

const TeamService = require('./../services/team.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createTeamSchema, updateTeamSchema, getTeamSchema } = require('./../schemas/team.schema');
const passport = require('passport');

const router = express.Router();
const service = new TeamService();

router.get('/', async (req, res, next) => {
  try {
    const teams = await service.find();
    res.json(teams);
  } catch (err) {
    next(err);
  }
});

router.get('/:id',
  validatorHandler(getTeamSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const team = await service.findOne(id);
      res.json(team);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createTeamSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newTeam = await service.create(body);
      res.status(201).json(newTeam);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validatorHandler(getTeamSchema, 'params'),
  validatorHandler(updateTeamSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedTeam = await service.update(id, body);
      res.json(updatedTeam);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getTeamSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedTeam = await service.delete(id);
      res.json(deletedTeam);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
