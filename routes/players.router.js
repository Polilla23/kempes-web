const express = require('express');

const PlayerService = require('../services/player.service');
const validatorHandler = require('../middlewares/validator.handler');
const { createPlayerSchema, updatePlayerSchema, getPlayerSchema, queryPlayerSchema } = require('../schemas/player.schema')

const router = express.Router();
const service = new PlayerService();

router.get('/',
  validatorHandler(queryPlayerSchema, 'query'),
  async (req, res, next) => {
    const query = req.query;
    try {
      const players = await service.find(query);
      res.json(players);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id',
  validatorHandler(getPlayerSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const player = await service.findOne(id);
      res.json(player);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/current-team/:id',
  validatorHandler(getPlayerSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const players = await service.findPlayersByCurrentTeamId(id);
      res.json(players);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/owner-team/:id',
  validatorHandler(getPlayerSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const players = await service.findPlayersByOwnerId(id);
      res.json(players);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/paying-team/:id',
  validatorHandler(getPlayerSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const players = await service.findPlayersByPayingSalaryTeamId(id);
      res.json(players);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  validatorHandler(createPlayerSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    try {
      const newPlayer = await service.create(body);
      res.status(201).json(newPlayer);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id',
  validatorHandler(getPlayerSchema, 'params'),
  validatorHandler(updatePlayerSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedPlayer = await service.update(id, body);
      res.json(updatedPlayer);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id',
  validatorHandler(getPlayerSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const deletedPlayer = await service.delete(id);
      res.json(deletedPlayer);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
